# Reference other classes

Referencing other Classes can be as easy as shown in the following example:

```ts
class Nested {
    @prop()
    public someNestedProperty: string;
}

class Main {
    @prop({ ref: () => Nested }) // for one
    public nested: Ref<Nested>;

    @prop({ ref: () => Nested }) // for an array of references
    public nestedArray: Ref<Nested>[];
}
```

> [!NOTE]
> Options `ref` and `type` can both also be defined w/o `() =>`, but is generally recommended to be used w/. If `() =>` is not used, there can be problems when the class (/ variable) is defined *after* the decorator that requires it.

## Reference other classes w/ different _id type

Sometimes the `_id` type needs to be changed (to something like `String`/`Number`) and needs to be manually defined in the reference:

```ts
class Cat {
    @prop()
    public _id: string;
}

class Person {
    @prop()
    public name: string;

    @prop({ ref: () => Cat, type: () => String })
    public pet?: Ref<Cat, string>;
}
```

> [!INFO]
> By default typegoose sets the default for the option `type` (if not defined) to `mongoose.Schema.Types.ObjectId`

> [!NOTE]
> The generic-parameter `IDType` from `Ref` is not automatically inferred from the generic-parameter `Class` yet (may be in the future)
> The option `type` is not automatically inferred at runtime, b/c this could cause more "Circular Dependency" issues.

## Common problems

Because of the order classes are loaded and reloaded at runtime, this might result in some references being null / undefined / not existing. This is why Typegoose provides the following:

```ts
class Nested {
    @prop()
    public someNestedProperty: string;
}

// Recommended first fix:
class Main {
    @prop({ ref: () => Nested }) // since 7.1 arrow functions can be used to defer getting the type
    public nested: Ref<Nested>;
}

// Not recommended workaround (hardcoding model name):
class Main {
    @prop({ ref: 'Nested' }) // since 7.1 arrow functions can be used to defer getting the type
    public nested: Ref<Nested>;
}
```

When you get errors about references, try making the name of the referenced class a string.

> [!CAUTION]
> The new `() => Class` is meant to help w/ Circular Dependencies, but cannot remove the problems in all cases, see Circular Dependencies for more.

## Circular Dependencies

As an warning in Common Problems already said, the `() => Class` way can help with circular dependencies, but not remove them, this is due to how javascript works.

The only known way to resolve the remaining problems, are to do something like to following to all class and model files:

Remove the following from File `A`:

```ts
import { B } from "./B";

import { B } from "./B";

export class A {
  @prop()
  public name: string;

  @prop({ ref: () => B })
  public b: Ref<B>;
}

- export const AModel = getModelForClass(A);
```

Remove the following from File `B`:

```ts
import { A } from "./A";

export class B {
  @prop()
  public name: string;

  @prop({ ref: () => A })
  public a: Ref<A>;
}

- export const BModel = getModelForClass(B);
```

And Add a central processing file:

```ts
+ import { A } from "./A";
+ import { B } from "./B";
+ 
+ export const AModel = getModelForClass(A);
+ export const BModel = getModelForClass(B);
```

This may seem like it is not changing much, but actually nodejs will resolve and load all required imports fully before trying to use any of them.

And because the `() => Class` way is used, the reference to `Class` will only be resolved once the function is actually called, that is why it works, but just `Class` doesn't.
