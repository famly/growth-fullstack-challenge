## Problem

The Payment Methods widget is missing a critical feature: A parent should always have at least one active payment method. Otherwise, the nursery cannot charge the parent for the care.

Unfortunately this is not the case right now. If you delete an active payment method, you end up with no active payment methods.

## Solution

Disallow deleting the last active payment. Inform the user that they cannot delete the active payment and that they must set another payment as active before deleting

Gray out the delete icon and add a mouse over explaining the reason

### Edge cases: 

What if there are no active payments when the page loads or no payments at all?

* Inform the user that there is an error on the page and that they must creater and set an active payment (less aggressive then the easier solution of just setting the first as the active payment)
