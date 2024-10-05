# ranked profs

## Criteria

Qualité de l'enseignement
- capable de répondre à une question
- qualité des corrections des exos
- écriture lisible
- explication du cours en général
- sait intéresser la classe
- impression générale

Rythme du cours
- vitesse et rythme d'un cours
- capable d'avancer dans les TD
- organisation
- connaissance de la matière, des cours
- qualité et vitesse de parole
- impression générale

Qualités humaines
- passion pour son travail
- qualité de la relation avec la classe
- à l'écoute en général
- autorité convenable
- impression générale

## Files organization:

files/teachers/folder for each teacher
./votes folder:
  -> one file per account with gradings for this teacher, json format

-> a pfp and a banner image

files/accounts
-> one file per account, contains encrypted password, temporary hash with expiration date

files/teachers.txt: all the teachers names

## Features

adjective depending on the results per category

login system with email, email once a month if changes?

not a huge job for the server to parse all the information from the teachers files, and to check whether an user has voted for one, but will still use cache (not stored in a file) for faster access, expires upon teacher info edit

briging back users: send an email if changes in the past month (if carry, get the data from the previous month, send an email to all users, then go to the next month)
email: system to guess what the most important event was among:
- an update being released (additionally, also select from another category if possible)
- a teacher being added, removed to the database
- a teacher going into first or last place, or switching places (middle spots become less interesting): for example "... has been elected as the best teacher? Do you agree? Vote now! Catch up!"
- always add the total number of votes cast and user changes

## TODO
favicon
reset vote popup scroll
better feedback on vote fail?
implement cache system for getting teachers information server side (see above)
login system
noscript
terms
admin page, download data
send mail once per month if changes
comments system
