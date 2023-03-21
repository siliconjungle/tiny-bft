# BFT Tiny Merge

On connect, send the list of max local seqs from each agent.
Also send the full list of global seqs and values.
This code has a limited number of bytes, so you do not need to worry about
agents flooding the server with data.
Each agent has a maximum number of seqs they can increase the global seq by.
The number is very large (1 billion), so you do not need to worry about
an agent doing it by accident. It's really just to stop an agent from
sending the max possible sequence number.
First you need to apply local seqs.
Then attempt to apply any global seqs and values.
If a global seq is too high for what is possible at that point in time
Then the change is invalid and should not be applied.
If a global seq is valid, then the value should be applied.
If the value is invalid, then the change is invalid and should not be applied.
Merges first take into account the global seq of the change, then the value.
This system can be exploited if an agent creates many accounts and sends
changes with the max possible global seq with each.
This is useful for situations where agents are not necessarily trusted,
but you still want to allow them to make changes.
Invite only situations and ones where identity verification is required
will also work.
