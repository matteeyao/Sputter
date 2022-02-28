# Quick start guide

## Quick overview of Typegoose

Typegoose is a "wrapper" for easily writing Mongoose models with TypeScript.

Instead of writing this:

```ts
// This is a representation of how typegoose's compile output would look
interface Car {
  model?: string;
}

interface Job {
  title?: string;
  position?: string;
}

interface User {
  name?: string;
  age!: number;
  preferences?: string[];
  mainJob?: Job;
  jobs?: Job[];
  mainCar?: Car | string;
  cars?: (Car | string)[];
}

const JobSchema = new mongoose.Schema({
  title: String;
  position: String;
});

const CarModel = mongoose.model('Car', {
  model: String,
});

const UserModel = mongoose.model
```

You can just write this:

```ts
class Job {
    @prop()
    public title?: string;

    @prop()
    public position?: string;
}

class Car {
    @prop()
    public model?: string;
}

class User {
    @prop()
    public name?: string;

    @prop({ required: true })
    public age!: number; // This is a single Primitive

    @prop({ type: () => [String] })
    public preferences?: string[]; // This is a Primitive Array

    @prop()
    public mainJob?: Job; // This is a single SubDocument

    @prop({ type: () => Job })
    public jobs?: Job[]; // This is a SubDocument Array

    @prop({ ref: () => Car })
    public mainCar?: Ref<Car>; // This is a single Reference

    @prop({ ref: () => Car })
    public cars?: Ref<Car>[]; // This is a Reference Array
}
```

> [!NOTE]
> `type` has to be defined when working with Arrays, because Reflection only returns basic information. Like `public: string[]` is in reflection only `Array`.

## Install

### npm

```zsh
npm install --save @typegoose/typegoose # install typegoose itself

npm install --save mongoose # install peer-dependency mongoose
```

### yarn

```zsh
yarn add @typegoose/typegoose # install typegoose itself

yarn add mongoose # install peer-dependency mongoose
```

## How to use Typegoose

Let's say you have a Mongoose model like this one:

```ts
const kittenSchema = new mongoose.Schema({
    name: String
});

const KittenModel = mongoose.model('Kitten', kittenSchema);

let document = await KittenModel.create({ name: 'Kitty' });
// "document" has no types
```

With Typegoose, it can be converted to something like:

```ts
class KittenClass {
    @prop()
    public name?: string;
}

const KittenModel = getModelForClass(KittenClass);

let document = await KittenModel.create({ name: 'Kitty' });
// "document" has proper types of KittenClass
```

> [!NOTE]
> `new KittenModel({})` has no types of KittenClass, because Typegoose doesn't modify functions of Mongoose, [read more here](https://typegoose.github.io/typegoose/docs/guides/faq#why-does-new-model-not-have-types)

## Do's and don'ts of Typegoose

* Typegoose is a wrapper for Mongoose's models

* Typegoose does not modify any functions of Mongoose

* Typegoose aims to get Mongoose's models to be stable through type-information from classes (without defining extra interfaces)

* Typegoose aims to make Mongoose more usable by making the models more type-rich w/ TypeScript

* Decorated schema configuration classes (like `KittenClass` above) must use explicit type declarations

## Extra examples

### Static methods

Sometimes extra functions for model creation or pre-written queries are needed, they can be done as follows:

```ts
class KittenClass {
  @prop()
  public name?: string;

  @prop()
  public species?: string;

  // the "this" definition is required to have the correct types
  public static async findBySpecies(this: ReturnModelType<typeof KittenClass>, species: string) {
    return this.find({ species }).exec();
  }
}
const KittenModel = getModelForClass(KittenClass);

const docs = await KittenModel.findBySpecies('SomeSpecies');
```

### Instance methods

Sometimes extra functions for manipulating data on an instance is needed, they can be done as follows:

```ts
class KittenClass {
  @prop()
  public name?: string;

  @prop()
  public species?: string;

  // the "this" definition is required to have the correct types
  public async setSpeciesAndSave(this: DocumentType<KittenClass>, species: string) {
    this.species = species;
    await this.save();
  }
}
const KittenModel = getModelForClass(KittenClass);

const doc = new KittenModel({ name: 'SomeCat', species: 'SomeSpecies' });
await doc.setSpeciesAndSave('SomeOtherSpecies');
```

### Hooks

Typegoose also supports hooks. They can be used like this:

```ts
@pre<KittenClass>('save', function() {
  this.isKitten = this.age < 1;
})
@post<KittenClass>('save', function(kitten) {
  console.log(kitten.isKitten ? 'We have a kitten here.' : 'We have a big kitty here.');
})
class KittenClass {
  @prop()
  public name?: string;

  @prop()
  public species?: string;

  @prop()
  public age?: number;

  @prop({ default: false })
  public isKitten?: boolean;
}

const KittenModel = getModelForClass(KittenClass);

const doc = new KittenModel({ name: 'SomeCat', species: 'SomeSpecies', age: 0 });
await doc.save(); // this should output "We have a kitten here."
const doc = new KittenModel({ name: 'SomeCat', species: 'SomeSpecies', age: 2 });
await doc.save(); // this should output "We have a big kitty here."
```

> [!NOTE]
> * Do not use Arrow Functions, b/c they will break the binding of `this`
>
> * For ESLint users: Make sure that rule `eslint-no-use-before-defining` is disabled, otherwise you might get ESLint errors / warnings inside the hooks
