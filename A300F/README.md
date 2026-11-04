# A300F

Trainingssimulator für die Abfertigung eines Airbus A300F4-600 (A300-600F).
Nur für Schulung. Ersetzt keine freigegebenen Ladeverfahren, keine LIR, kein Loadsheet und nicht die IATA DGR.

## Aufbau

| Datei | Aufgabe |
| --- | --- |
| `js/data.js` | Alle technischen Werte (Flugzeug, Türen, Gewichte, die vier ULD Typen, Konturen). Jeder Wert hat Status und Quelle. |
| `js/rules.js` | Prüfregeln ohne 3D: Kontur, Überstand, Auflage, Stapelbarkeit, Flächenlast, ULD Gewicht, Tür, Position, Gewicht und Schwerpunkt, AWB Prüfziffer. |
| `js/builder.js` | ULD Aufbau mit eigener 3D Ansicht, Ziehen und Drehen der Packstücke, Netz und Gurte, Lernszenarien. |
| `index.html` | Flugzeug, Vorfeld, Team, Ladeplan, Animation mit Zeitleiste, Oberfläche. Nutzt Three.js r128. |
| `A300F_ULD_und_Decks.skp` | SketchUp Modell der vier ULDs mit Konturen und der Decks (über den Link aus dem Chat laden). |

## Status der Daten

* **geprüft**: Hersteller oder mehrere Quellen stimmen überein
* **aus deinem Dokument**: aus den Bildern des Nutzers
* **Quellen widersprechen sich**: im Training gilt der vorsichtigere Wert
* **Trainingsannahme**: frei gewählt, nicht im Betrieb verwenden
* **nicht verifiziert**: aus Geometrie abgeleitet

## Erlaubte ULD Typen

Nur PAG, PMC, PAJ und AKE. Andere Typen werden bewusst nicht angeboten.

## Offene Punkte

* Airbus Dokument "Airplane Characteristics A300F4-600" direkt prüfen (aus der Arbeitsumgebung nicht abrufbar).
* Echte Konturkoordinaten, Positionslimits, Stationsarme und Schwerpunktgrenzen aus dem Weight and Balance Handbuch des Betreibers.
