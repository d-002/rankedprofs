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

website links in single teacher view

rank

change buttons styling on click: bg color same as border, box sizing border box

crown for the best teacher

can show teachers pfp in fullscreen of course :)

adjective depending on the results per category

overview with progression bars

notice to share this quietly

login system with email, email once a month if changes?

not a huge job for the server to parse all the information from the teachers files, and to check whether an user has voted for one, but will still use cache (not stored in a file) for faster access, expires upon teacher info edit

## TODO
reset vote popup scroll
not mobile to desktop
property for sliders x, for animation
better feedback on vote fail?
terms
implement cache system for getting teachers information
login system
noscript
admin page, download data
user suggestions (3 per account?)
send mail once per month if changes
