# golinks-hack
An Express.js web service with an endpoint to return repository stats given a github username.

Is currently deployed on Heroku: https://golinks-github-stats.herokuapp.com/

The main endpoint is '/stats', there are two paramaters, a required 'username' and an optional 'forked'. When specifiying forked=false, stats will only be gathered for repositories that aren't forked. Unless specified otherwise via the parameter, stats for all repositories will be gathered.

Sample api calls: 

GET "https://golinks-github-stats.herokuapp.com/stats?username=krobison10"

GET "https://golinks-github-stats.herokuapp.com/stats?username=krobison10&forked=false" (to only gather stats for repos that aren't forked)
