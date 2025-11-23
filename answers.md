# Exercises - Answers

### Overall:
There's no E2E test suite in place. As this isn't asked, I'm not implementing it, but in real world scenario I'd argue for a fitting E2E test set up.

### 1
#### Reasoning: 
- The components don't update after successful response is being received
- Either the response is processed or we re-fetch the list of all payment methods.
- Apollo client provides `refetch` [https://www.apollographql.com/docs/react/data/refetching] to execute get-all query again.

### 2: 
#### Reasoning:
- The deletion happens based on the method name, which is not necessarily unique. 
- To address the deletion matter itself the easy way is to delete methods by ID instead of name.
- IMO This shouldn't be possible in the first place - a UNIQUE on the method name would be a good solution (sample migrtion in the respective dir). Constraint violations would need to be propertly handled.

### 3
#### Reasoning:
- The frame for this exercise is an automated test indicating there should be only one active method, while the exercise mentions "at least one" active methods, implying more than one active methods. The requirements aren't clear.
- Additionally the condition of "no active method" is also true, if no payment method exists at all. Therefore the last (active) method can't be deleted.
- The exercise can be tackled in multiple ways, e.g.: 
    1. Making active methods never deletable. (requires the parent to activate/creating another methods before creating - maybe not user friendly)
    2. Deleting active methods is possible, as long as nother inactive method can be made active instead. (might be nicer UX, might activate outdated methods)
#### Scoped out:
- Another aspect is that methods are always created deactivated. If A user is new and has no payment method, it would be inactive by default. One way to fix this, is activating new methods by default. Scoping this user story out.
- Proper UI changes like error handling are scoped out, could e.g. be solved with a user friednly toast message 
#### Optimizations:
- No filtering the active methods in memory, but via predicate pushdown.