KNACSS
======

Projet en ligne : <http://www.knacss.com/>

Téléchargement : <https://github.com/raphaelgoetter/KNACSS>

KNACSS est une feuille de style CSS minimaliste, responsive et extensible pour débuter une intégration HTML / CSS,

KNACSS est né d'un constat que nous faisons quotidiennement dans notre agence web :

* La plupart des frameworks CSS sont de grosses usines à gaz que l'on n'exploite très partiellement (environ 10% à 20% au mieux)
* Ils nécessitent quasi systématiquement qu'on redéfinisse à sa sauce la moitié des styles
* Ils ne sont pas négligeables en terme de poids de fichiers

KNACSS n'est pas non-plus un "reset" CSS classique tels que ceux que l'on trouve chez Eric Meyer, Yahoo UI ou Normalizr, que l'on estime trop agressifs et qui nécessitent que l'on redéfinisse chaque élément par la suite. Il se charge du minimum pour éviter les différences d'affichage flagrantes.

Chez Alsacréations, et par expérience, on préfère de loin un socle de base minimaliste qui convienne tel quel à tous les nouveaux projets, mais qui puisse être progressivement enrichi. C'est le cas de KNACSS.

En résumé :

* KNACSS est une feuille de style CSS minimaliste et extensible pour débuter une intégration,
* Ce n'est volontairement ni un reset CSS complet, ni un framework CSS intégral,
* L'objectif est d'être complètement extensible et modulable selon vos projets,
* Il est constitué d'un fichier CSS unique pour éviter des requêtes et des chargements inutiles,
* Il n'est volontairement associé à aucun préprocesseur tel que LESS ou Sass parce que nous (Alsacréations) ne les employons pas systématiquement, mais rien ne vous en empêche.

KNACSS est sous [licence libre CC-BY](http://creativecommons.org/licenses/by/3.0/fr/ "Creative Commons &mdash; Attribution 3.0 France - CC BY 3.0")

Plus d'info : <http://www.knacss.com/>

Installation
------------

Il n'y a pas d'installation à proprement parler. Ce n'est qu'un fichier CSS que vous pouvez appeler comme il se doit avec un élément link.

     <link rel="stylesheet" href="knacss.css" media="all">

Il contient une base minimale de styles prête pour débuter votre projet. Servez-vous en comme un "reset" et faites le évoluer selon votre projet.

Prenez le temps de lire toutes les indications et pistes (voir les liens explicatifs fournis par exemple) avant de vous jeter dessus.
KNACSS n'est pas forcément destiné aux débutants complets et certaines subtilités peuvent avoir de grosses conséquences.

Par exemple le choix a été fait de modifier tous les calculs des tailles d'éléments à l'aide de la propriété box-sizing, c'est loin d'être anodin et il faut vraiment comprendre ce que cela implique, notamment en terme de compatibilité envers les anciens navigateurs (IE7) et du fichiers "polyfill" requis.

De même pour les positionnements : il est prévu de pouvoir disposer de deux schémas de positionnement différents, de gérer les gouttières et les largeurs des boîtes, nous partons du principe que l'utilisateur maîtrise déjà correctement les positionnements CSS avant d'avoir recours à des frameworks.

Compatibilité
-------------

* Firefox, Chrome, Safari, Opera : toutes versions
* Internet Explorer : toutes versions en général
* Navigateurs mobiles
* Particularités IE6 / IE7 : box-sizing nécessite un polyfill (fichier joint), le schéma de positionnement .col doit être accompagné d'une largeur définie (par de blocs fluides sur IE6 / IE7)

Tutoriel pas à pas
------------------

Un tutoriel complet est disponible à cette adresse : <http://www.knacss.com/demos/tutoriel.html>

Un document de présentation au format PDF : <http://fr.slideshare.net/goetter/des-css-efficaces-avec-knacss>