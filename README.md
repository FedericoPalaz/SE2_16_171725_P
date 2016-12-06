#SE2 project

The project wishses to represent what could be a part of the university or MIUR website.   
It's a map of Italian universities that allows to select and display different information about each one, if 2 universities are selected a comparison is made.  
I've tried to keep the map and the site responsive while maintaining the possibilty of selecting universities from the map. Functionality is partially retained if the user has no javascript (the user can still get information about a university, but no comparison).  
The data displayed is randomly generated, and for each of the 3 categories data is divided into (teaching, reserach, local life), there are 4 statistics, the number and the name of the statistics for each category is just a proof of concept, they could be more or different.  
Urls that would normally 404 get redirected to the home.  



To run this project locally or to run some of its test files (specs) you need to have a postgres sql database running, a script for the creation of the required tables is in the root of the project, and it's named "script.sql". Once you run it for the first time, you can contact the url 127.0.0.1:5000/db to have the application randomly generate data.


Testing has been done with jasmine-node ("normal" jasmine won't work, i've added jasmine-node as a dependency just in case) and with the module "rewire".


Apis are described in a .yaml file contained in the directory "api".  
A pdf showing in a more detailed way the prototype/idea wich this project comes from is in the root of the project, and it's named "metricheUni.pdf".  
The current build is hosted on heroku:  
https://uniinfo.herokuapp.com/



