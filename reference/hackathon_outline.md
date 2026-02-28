# The Loop Scanvenger Hunt


## Gneneral Ideas

- Scavenger hunt game similar to Pokemon Go that teaches you how to use the CTA as well
- Each station gets you points and also once at the station you get to see what's around you
- Maybe start with a single line
- GPS location determines so that you are at the station (Geo-fencing)
- Web app as MVP
- GPS spoofing
- GEO Fencing in the CDM building with multiple spots to demonstrate
- host on digital ocean?
- host on raspberri pi

## Features

### Travel Aspect
1. Go to Places
2. Get points
3. See local POI
4. Get more points

### Scoring
- Reset every week
- reivist place decrease  + points
- Maybe resets back

### User Profile
- Hi-score
- Medals
- Stamp book
- Username - Authemail optional
- Friends!

## UI
- User Profile
- Stampbook
- Leaderboard
- Map Image

## Database
- Spring does its magic, endpoints are built to point to table objects
- build 2 tables to start
    - USER
        - uid/email
        - pw
    - POI
        - id
        - name
        - coordinate
        - description



## Tech Stacks
- Google API for Geo fencing
- Hosting Pi
- Ledger/db 
- Things to do can be static
- Open street map 

