// Ron is trying to figure out how to actually do matching before implementing it on the frontend
// These are his ramblings.


//! Users   Matches
//!  1         2, 3, 5
//!  2         1, 7
//? If user 1 matches user 2 AND user 2 matches user 1
//?     then add them both to each others "matches" on the frontend
//? If user1 matches user2 and user 2 hasn't seen user 1 yet
//?     then have user 1 show up at the front of user 2s SWIPE on the frontend
//? if user1 matches user2 and user 2 has already declined user 1
//?     then do nothing? do something?

// TODO: SCRATCH TAHT SHIT. Only focus on the matches table. If the users happen to match on each other, then they should show up on the "matches"
// TODO: on the frontend. FORGET ABOUT NOTIFACTION OR KEEPING TRACK OF DECLINES.
// TODO: Also, use the minimum viable implementation (NAIVE APPROACH) that will check each user that is in my matches table and 
// TODO: see if they match with me. If they do, then show on the frontend.

