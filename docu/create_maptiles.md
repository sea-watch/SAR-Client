Generating Maptiles
====================
This document is a description how to generate offline maptiles for the application.


Create .mbtile
---------------
The application comes with zipped maptiles. To generate your own maptiles you need to download  [tilemill](https://tilemill-project.github.io/tilemill/) and export your map as .mbtile.

Generate png tiles
------------------
The generated .mbtile can be used to generate the .png tiles with [mbutil](https://github.com/mapbox/mbutil).

After exporting the maptiles you can zip the directory, created by mbutil, and replace the data/map-tiles.zip with your zip. Afterwards your tiles should be loaded.


Comments
---------
To get a got mixture of size and completeness it is a good idea to create mbtiles for seperate zoom levels, so that you export the higher zoom levels only for areas in which your application will be used.

