# Exercises - Answers

### Overall:
There's no E2E test suite in place. As this isn't asked, I'm not implementing it, but in real world scenario I'd argue for a fitting E2E test set up.

### 1
Reasoning: 
- The components don't update after successful response is being received
- Either the response is processed or we re-fetch the list of all payment methods.
- Apollo client provides `refetch` [https://www.apollographql.com/docs/react/data/refetching] to execute get-all query again.

### 2: 
Reasoning:
- The deletion happens based on the method name, which is not necessarily unique. 
- To address the deletion matter itself the easy way is to delete methods by ID instead of name.
- IMO This shouldn't be possible in the first place - a UNIQUE on the method name would be a good solution (sample migrtion in the respective dir). Constraint violations would need to be propertly handled.

