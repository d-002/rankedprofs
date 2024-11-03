# ranked profs

## Features

adjective depending on the results per category

login system with email, email once a month if changes?

not a huge job for the server to parse all the information from the teachers files, and to check whether an user has voted for one, but will still use cache (not stored in a file) for faster access, expires upon teacher info edit

long-term user retention: send an email if changes in the past month (if carry, get the data from the previous month, send an email to all users, then go to the next month)
email: system to guess what the most important event was among:
- an update being released (additionally, also select from another category if possible)
- a teacher being added, removed to the database
- a teacher going into first or last place, or switching places (middle spots become less interesting): for example "... has been elected as the best teacher? Do you agree? Vote now! Catch up!"
- always add the total number of votes cast and user changes

Add quotes

Add more images (folder, portfolio design)

## Signin process
Two ways to connect: email and google

accounts are stored in files/accounts folder, filename is email

signin: server-side, get the strategy from the request, but only to get the email, as after that check if the strategy is the correct one from the account file. If the strategies are different, signin fails: for example, an account created through google signin doesn't have a stored password hash, so this could cause issues.

client-side variable for signin strategy ("email" or "google")

once the user is successfully logged in, hide the login popup and require all teachers data

### Email
first check: if the file has email strategy, is not verified and the creation date is more than a day away, delete the file

**Signup**
check if new user
create account file, contents:
{"verified":0,"pwdHash":[hashed password],"creationDate":[timestamp]}
send verification email
email contains a link to /email?code=[temp code]
create a socket and send the code. compare, send feedback, disconnect socket
if the operation was successful, the user is redirected to / and "verified" is set to 1
the other page should stay in the login state, so you can still login but not signup (the user is now registered)

**Signin**
hash the password and compare, if wrong stop there
if "verified" is set to false, give feedback and allow to resend a verification email, then do the steps for signup
otherwise send feedback

**Signout**
just reload the page

### Google
send hashed data to the server, decode email
signup / signin: check if the file exists, also delete it if waiting for email verification and created more than a day before

## TODO
favicon
reset vote popup scroll
implement cache system for getting teachers information server side (see above)
login system
noscript
terms
google developer console
admin page, download data
user retention
comments system
remember me
