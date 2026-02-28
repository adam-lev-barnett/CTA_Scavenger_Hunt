# The Loop Scanvenger Hunt

this application is a scavenger hunt game based on the CTA L lines. You can visit locations for points, simmilar to pokemon go. Major locations are the train stations. Once you visit a station, you are given options to visit nearby points of interest for additional points. Users will also have a stamp book that stores the locations that you've visited previously.

## Implemetation 
### Backend
Stack:
postgres/sql, Java/Spring, React/typescript. We're also planning to convert some python into typescript to make it easier for people whose native language is Python.

#### Database/Entities/models:
Build a postgres sql databases to store  user information and points of interest.
Points of interest have names, point values, and a list of nearby points of interest.
Train stations would be a subclass of points of interest that serve like hubs to poit you in different directions.

#### API calls:
Call from the Overpass API for our map and points of interest. Use Google's geofencing API to ensure that users are actually at their location and to pinpoint distance from other locations

#### Other Logics
User profile class has a hi-score, medals for achievemants, a stamp book, a username, and a friends list.

Stamp books have a list of locations attached to boolean values that determine whether or not a location has been visited.

Scores and a leader board would reset weekly, but stamp books do not reset. If you visit a locatino you've been before and try to gain points, you get fewer points than if you visit it for the first time.

### Frontend
- User profiles with their visible stamp book
- Leaderboard
- Image of the map as you're walking through the city along with markers for specific points of interest that you visit
- Instructions and an about page
- Contact area for issues or general contacting things
- Registration

## Expected typical usage:
1. register and log in
2. Pick a station to go to
3. Collect points from the station
4. Look at a list of nearby points of interest
5. Travel to one or more points of interest and collect more points
6. Learn about local history/background related to the neighborhood and/or points of interest (like a tour guide)
7. Look at stamp book to view where I've visited 
8. See if my score reached the leaderboard

## Extras
Following routes to different points of interest that give you "combo" points

