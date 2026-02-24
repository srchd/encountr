# DnD 5etools DM Screen Encounter Display

This tool allows you to have a displayable version for encounters tracked on [5etools DM Screen](https://5e.tools/dmscreen.html).

Using 5etools' DM Screen, you will be able to have the page display information from the encounter, such as:
- Current Round
- Current creature on turn
- Initiative order
- Health status of each player
  - If wanted, can show exact HP (see below)
- Health status of each monster
  - If wanted, can show exact HP (see below)
- Pictures for each combatant (PC and monsters)

![example](doc/images/example.png)

## Installation Guide
### Windows
1. Make sure [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/) is installed
2. Make sure Docker Desktop is running.
3. Start/double click on **build_docker.bat**
4. Type in your browser: http://YOUR.LOCAL.IP.ADDRESS:8080

## How To Use
### Windows
1. Start/double click on **start_docker.bat**
  - Or just type `docker compose up` if display and hosting will be done on the same machine
2. Type in your browser: http://YOUR.LOCAL.IP.ADDRESS:8080
3. Start up [5etools' DM Screen](https://5e.tools/dmscreen.html)
4. Add an Initiative Tracker (Plus -> Special -> Initiative Tracker)
5. Click on the ![profile_icon](doc/images/dmscreen_profile_icon.png) icon.
6. Select Standard
7. Start Server
8. Copy token
9. Paste token in the webapp
10. Press connect.

## Customization Options
![InitiativeTracker](doc/images/initiative_tracker.png)


If you do not wish to show a monster (yet), you can disable it from the display, by hiding it in 5etools' DM Screen just by clicking on the eye icon. If it is crossed, it will not show up.


By default, 5etools' DM Screen does not send the exact HP of each creature. The application will show the status of the monster and/or player
if the settings is not changed. If needed to show the exat HP, turn on these settings in the Initiative Tracker settings **(gear icon on the bottom right)**:
  - Player View: Show exact player HP
  - Player View: Show exact monster HP

**Note:** By default, players' HP is not filled. If the DM is not tracking it on the DM Screen, it will always show like they at full health.

- In order to show the players' avatar/image, you need to modify the `public/assets/players.json` file.
  - Modify player name
  - Add an URL or local image file to the `imageUrl` field.

- If any modification has been done, you need to **rebuild** and **restart** the docker image!

## Troubleshooting/FAQ:
1. Monsters are not showing:
   - Make sure that the "eye" icon is not crossed out in the DM Screen.
2. Website does not load:
   - If the web page will be displayed on a different machine, than the docker is running on, you need to use **start_docker.bat**. After that, make sure that you are trying to connect to your **LOCAL IPv4** address. You can check it by running **ipconfig** on Windows. You will see a bunch of stuff, but you need the one that *usually* starts with **192.168**

If you face a problem which is not detailed here, raise an issue.
