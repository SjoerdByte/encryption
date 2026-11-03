# Encryption

Een kleine webapp om tekst te versleutelen en te ontsleutelen met symmetrische
encryptie. Alles draait lokaal, de tekst en het wachtwoord worden nooit naar een
server gestuurd of opgeslagen.

## Draaien

```bash
npm install
npm start
```

Daarna staat de app op http://localhost:3000.

## Hoe het werkt

Bij het versleutelen leidt de app uit je wachtwoord een sleutel af met PBKDF2-HMAC-SHA256 (600 000 iteraties) en een
nieuwe, willekeurige salt. Daarmee versleutelt hij de tekst met AES-256-GCM en een nieuwe, willekeurige IV. De uitvoer
is base64 van drie delen achter elkaar; de salt, de IV en de versleutelde tekst met de GCM auth tag. Bij het
ontsleutelen gebeurt hetzelfde omgekeerd.

AES-256-GCM is authenticated encryption. Klopt het wachtwoord niet, of is de
versleutelde tekst aangepast, dan faalt het ontsleutelen met een foutmelding in
plaats van onzin terug te geven.

Dit gebeurt volledig in de browser met de Web Crypto API, een standaard,
goed geteste cryptografische library.

## Symmetrisch versus asymmetrisch

Bij symmetrische encryptie gebruik je 1 sleutel voor zowel versleutelen als
ontsleutelen, zoals bij AES. Dat is snel, maar beide kanten hebben dezelfde
geheime sleutel nodig, en die veilig delen is het lastige punt.

Bij asymmetrische encryptie heb je een sleutelpaar. een public key om mee
te versleutelen en een private om mee te ontsleutelen, zoals bij RSA of
ECC. Dat lost het delen op, maar is traag. In de praktijk combineer je ze vaak,
asymmetrisch om een symmetrische sleutel uit te wisselen, en daarna symmetrisch
voor de data zelf. Dat is precies wat TLS doet. Deze opdracht richt zich op de
symmetrische kant, dus op AES.

## Keuze van het algoritme

Ik gebruik AES-256-GCM. AES is de standaard van het NIST, is jarenlang
geanalyseerd en wordt door moderne processors in hardware versneld. De 256-bits
sleutel geeft een ruime marge. GCM is gekozen boven een modus als CBC omdat GCM
naast vertrouwelijkheid ook integriteit geeft: je merkt het als er met de tekst
is geknoeid, en je hoeft niet zelf een losse MAC toe te voegen, wat makkelijk
fout gaat.

Voor het omzetten van een wachtwoord naar een sleutel gebruik ik PBKDF2 met
SHA-256 en 600.000 iteraties, de huidige OWASP-aanbeveling. Dat maakt het
afleiden expres traag, zodat het gokken van wachtwoorden duur wordt. Argon2 zou
nog sterker zijn omdat het ook geheugen-hard is, maar de Web Crypto API in de
browser biedt alleen PBKDF2 standaard aan lol. Een logische vervolgstap zou zijn om
naar Argon2 over te stappen zodra dat in de browser breed beschikbaar is.

## Sleutelbeheer

Generation. De sleutel wordt niet zelf bewaard, maar steeds opnieuw afgeleid uit
het wachtwoord en een willekeurige salt. De webapp heeft ook een knop om een
sterk, willekeurig wachtwoord te genereren.

Storage. Er wordt niets opgeslagen: niet het wachtwoord, niet de afgeleide
sleutel en niet de tekst. In de browser blijft het tijdens de sessie in het
geheugen, de server ziet het nooit.

Distribution. Dit is de zwakke plek van symmetrische encryptie. Wil iemand
anders je bericht lezen, dan heeft die hetzelfde wachtwoord nodig, en dat moet
je via een apart en vertrouwd kanaal delen, niet samen met de versleutelde
tekst. Dat schaalt slecht: als veel mensen onderling veilig willen
communiceren, heb je al snel enorm veel verschillende wachtwoorden nodig. Juist
dat probleem is de reden dat asymmetrische en hybride systemen bestaan.

Security Implications. De veiligheid hangt volledig af van de sterkte van het
wachtwoord en van het geheim houden ervan. Lekt het wachtwoord, dan ligt alles
wat ermee is versleuteld open. En geen enkel schema helpt als het apparaat zelf
besmet is, bijvoorbeeld met een keylogger.

## Kerckhoffs Principe

Kerckhoffs zegt dat een systeem veilig moet zijn, zelfs als alles behalve de
sleutel publiek bekend is. Deze app voldoet daaraan. Het hele ontwerp staat open
op GitHub: het algoritme (AES-256-GCM), de sleutelafleiding (PBKDF2 met 600 000
iteraties), de opbouw met salt en IV, en alle code. Het enige geheim is het
wachtwoord. De veiligheid zit dus in de sleutel, niet in het verbergen van hoe
het werkt. Het feit dat alles in de browser gebeurt en er geen verborgen stap op
een server zit, past daar goed bij want wat je ziet is precies wat je beschermt.


# Test
1esdka7-m6kbib-1nnxlta-5ap7p4

dj8QQ7FoUo5QW83vZ/OWBRxrktx+5x+vtXXsNF+/xwtjrtMM+cRNRtHOATJN4M9YTry0ZWWv1vgxwVlmo+5ZuJW91DDZUHEMxnGDhO8Eg0zbEO57w9bOGpnSoXhkwBYHXw==

Leuke opdracht 10/10