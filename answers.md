# Exercises - Answers

### Overall:
There's no E2E test suite in place. As this isn't asked, I'm not implementing it, but in real world scenario I'd argue for a fitting E2E test set up.

### 1
Reasoning: 
- The components don't update after successful response is being received
- Either the response is processed or we re-fetch the list of all payment methods.
- Apollo client provides `refetch` [https://www.apollographql.com/docs/react/data/refetching] to execute get-all query again.
