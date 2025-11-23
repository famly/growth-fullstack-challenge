# Exercises - Answers

### Overall Considerations:
- There's no E2E test suite in place. As this isn't asked, I'm not implementing it, but in real world scenario I'd argue for a fitting E2E test set up.
- The Queries are sending post requests, which is simple and works fine. However this limits CDN caching, so in certain scenarios, GET requests might make sense.

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

### 4
#### Reasoning:
- First checked the migration to see there's no timestamp column existing in the data model yet.
- To mimic prod behavior the initial migration should remain unalertered and a new migration should update the data model.
- For simplicity I'll take the DB servers system time and assign a default value. 
- The existing payment method values should be back-filled using the parent's first invoice timestamp for the lack of a better alternative.
- After the data model is updated, the PaymentMethod types need to be updated to reflect the new model.
- The frontend component should display the creation date.
#### Scoped out:
- Famly operates in a mutli-timezone context, therefore not only the timezone but also the offset should be stored. A timezone offset could be e.g. implemented by DB Tentant ID, Nursery-home address, Parent Address, etc. and should be aligned with the business domain. I'll treat everything as UTC now.


### 5
#### Reasoning:
- First thing that comes to mind is creating a PaymentMethodHistory table.
- The history table needs to document the timestamp (e.g. analogue to task 4) and the id of the entity (e.g. user) who made the change
- A history entry moreover needs to hold the id to the current state of the respective PaymentMethod entity.
- The historization of actual PaymentMethod snapshots could be approached in at least 2 ways:
 1. Creating a full history by snapshotting the whole PaymentMethod object. This will come in handy, when restoring, however it stores non-updated attributes redundantly.
 2. Creating a "diff" view, by abstracting change, like (FieldName, OldValue, NewValue,...)
For robustness, I'm rolling with approach 1.

Here's a sample api call

`curl -X POST http://localhost:9000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ paymentMethodHistory(paymentMethodId: 1) { id paymentMethodId parentId method isActive changedAt changedByUserId } }"
  }'`

#### Scoped out:
- We could add a soft delete logic including with a deleted_at timestamp. Efficieny, Restoring,... 
- We could also add a hinf on the change type, e.g. an enum indicating creation, updating, deletion...
- Proper user ids for the changing entity. In case someone else than the parent changes the payment method (e.g. customer service), mutliple values could be used, so I'm just going with a random int here...
- This should also receive proper testing.
