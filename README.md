# CloudFlare Rate-Limiting like service proof-of-concept implemented using RLN and InterRep

### Prerequisites

1. Docker and docker-compose, for the MongoDb database.

### Install instructions 

1. `yarn`

### Startup instructions

1. Start the DB and the DB explorer containers:
`docker-compose up -d`,

Then run the apps:

1. `yarn interrepMock`
2. `yarn server`
3. `yarn appExample`
4. `yarn client` # single client simulation
5. `yarn multiClient` # multi client simulation

extra (simulate multiple separate clients in real time):

6. `yarn user1` # normal user
6. `yarn user2` # user that spams
6. `yarn user3` # normal user from other group


### Description

This repository contains a PoC application for a CloudFlare-like rate limiting service implemented using the RLN construct and the InterRep linking service. The idea is that users already registered to InterRep (their identity commitment being added to some of the semaphore groups) can access applications protected by the Rate limiting service. If the users are caught spamming, then they will be "banned" from all of the applications protected by the service, by the properties of the RLN protocol. The users will not be be removed from the semaphore groups at the InterRep service, but only at the RLN service.

This is a simple PoC, and much more advanced rate limiting logic can be applied (i.e request limiting and proof generation based on more advanced heuristics), but the purpose of the PoC is how RLN can be applied and used for this kind of applications.

There are 4 different components:

- InterRep (web2 to web3 account linking service with privacy properties), serves as access permit
- Rate limiting service - rate limiting middleware between the users and the appps
- Apps - applications protected by the Rate limiting service (need to register to the rate limiting service for protection first)
- Users

The rate limiting service synchronizes the membership tree from the InterRep service. Currently a mock app for the InterRep service is used that stores two semaphore groups. The synchronization with the InterRep membership tree happens periodically (on a preset time interval), by reading the newly added identity commitments, for which the Rate Limiting service is unaware of. This can be improved by adding a smart contract event listener which listens for `NewRootHash` events from the `InterRepGroups` contract.
The rate limiting service keeps it's own merkle tree, which contains all of the identity commitments from the InterRep's merkle tree. Once a user is banned, the merkle tree in the rate limiting service is modified (only the merkle tree for the group in which the banned user is part of), the leaf for the banned user is zeroed out. If the banned user tries to send new request, they will be blocked by the rate limiting service, because their proof will be invalid. The tree in the InterRep service is not modified in any way.

The connected users to the rate limiting service will get notifications via websockets (SocketIO) when a new user is registered to their group or a user is slashed. The clients can use these notifications to obtain a new witness from the RL service, in order to be able to generate valid proofs.

For more details around the idea, please refer to: https://ethresear.ch/t/decentralised-cloudflare-using-rln-and-rich-user-identities/10774

For the details about InterRep <-> RLN integration and tree syncing, please read the following doc: https://hackmd.io/@aeAuSD7mSCKofwwx445eAQ/SJpo9rwrt.


### TODO items and possible improvements:

- Improving upon the RLN construct to treat duplicate messages per epoch as spam too, or using a different signal rather than the url
- "Smarter" synchronisation protocol, so that the witness is marked as stale on the client side on member addition/removal and a new witness is obtained before the next request is made
- RLN identifier for each different app. This will allow for more accurate spam detection, right now the request number per epoch is tracked globally and the users might be treated as spammers if they send multiple requests to different apps.