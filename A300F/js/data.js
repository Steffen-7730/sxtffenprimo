/* A300F Simulator · Datenmodul
   Einzige Quelle für technische Werte. Jeder Wert hat einen Status und Quellen.
   Status:
     ok        geprüft, Hersteller oder mehrere unabhängige Quellen stimmen überein
     doc       aus einem Dokument des Nutzers (Bilder), nicht unabhängig geprüft
     conflict  Quellen widersprechen sich, im Training gilt der vorsichtigere Wert
     train     Trainingsannahme, frei gewählt, im echten Betrieb nicht verwenden
     unver     nicht verifiziert, aus Geometrie abgeleitet
*/
window.A300F = window.A300F || {};
(function (A) {
  'use strict';

  A.STATUS = {
    ok:{label:'geprüft', cls:'st-ok'},
    doc:{label:'aus deinem Dokument', cls:'st-doc'},
    conflict:{label:'Quellen widersprechen sich', cls:'st-conflict'},
    train:{label:'Trainingsannahme', cls:'st-train'},
    unver:{label:'nicht verifiziert', cls:'st-unver'}
  };

  A.SRC = {
    airbus:{name:'Airbus, A300-600 Seite', url:'https://www.airbus.com/en/who-we-are/our-history/commercial-aircraft-history/previous-generation-aircraft/a300-600'},
    airbusF:{name:'Airbus, A300-600F Seite', url:'https://airbus.com/en/who-we-are/company-history/commercial-aircraft-history/previous-generation-aircraft/a300-600/a300-600f'},
    ac:{name:'Airbus Airplane Characteristics A300F4-600, Dez. 2009 (aus dieser Umgebung nicht abrufbar)', url:'https://aircraft.airbus.com/sites/g/files/jlcbta126/files/2023-02/Airbus-Commercial-Aircraft-AC-A300F4-600-Dec-2009.pdf'},
    ahk:{name:'air Hongkong Datenblatt A300-600F (dein Bild 4)'},
    img1:{name:'Ladeplan A300-600F mit Positionen 1 bis 32 (dein Bild 1)'},
    img3:{name:'Ladeplan mit 1 bis 13 und P1 bis P7 (dein Bild 3)'},
    gcc:{name:'GCC Ports, Aircraft Technical Data A300-600', url:'https://gccports.com/aircraft-technical-data-details/airbus-a300-600'},
    awd:{name:'Aircraft World Directory', url:'https://aircraftworlddirectory.com/civil/a/airbusa300600.htm'},
    airfreight:{name:'airfreight.com, A300-600F', url:'https://www.airfreight.com/air-charter/airbus-a300-600f'},
    wiki:{name:'Wikipedia, Unit load device', url:'https://en.wikipedia.org/wiki/Unit_load_device'},
    dsvPag:{name:'DSV, P1P/PAG Palette', url:'https://www.dsv.com/en/our-solutions/modes-of-transport/air-freight/unit-load-devices/p1p-pag-pallet'},
    dsvPmc:{name:'DSV, P6P/PMC Palette', url:'https://www.dsv.com/en/our-solutions/modes-of-transport/air-freight/unit-load-devices/p6p-pmc-pallet'},
    dsvAke:{name:'DSV, LD3/AKE Container', url:'https://www.dsv.com/en/our-solutions/modes-of-transport/air-freight/unit-load-devices/ld3-ake-ave-container'},
    swiss:{name:'Swiss WorldCargo, Paletten', url:'https://www.swissworldcargo.com/en/network_fleet/fleet_ulds/ulds/pallets'},
    eth:{name:'Ethiopian Cargo, ULD Liste', url:'https://cargo.ethiopianairlines.com/network/uld'},
    vrrPag:{name:'VRR, PAG Palette (Hersteller)', url:'https://vrr.aero/products/pag-pallet/'},
    vrrPmc:{name:'VRR, PMC Palette (Hersteller)', url:'https://vrr.aero/products/pmc-pallet/'},
    iagAke:{name:'IAG Cargo, LD3 AKE', url:'https://www.iagcargo.com/en/fleet/ulds/ld3-ake/'}
  };

  /* Flugzeug A300F4-600 (A300-600F) */
  A.AIRCRAFT = {
    name:'Airbus A300F4-600 (A300-600F)',
    length:{v:54.08, u:'m', st:'conflict', src:['awd','gcc','airbus'], note:'Airbus Webseite nennt 54,10 m, andere Quellen 54,08 m.'},
    span:{v:44.84, u:'m', st:'ok', src:['airbus','awd']},
    height:{v:16.50, u:'m', st:'conflict', src:['airbus','awd'], note:'Airbus Webseite 16,50 m. Andere Quellen 16,53 m und 16,62 m. Der Wert 16,26 m ist in keiner Quelle belegt.'},
    fuselage:{v:5.64, u:'m', st:'ok', src:['airbus'], note:'Airbus nennt 5,64 m Rumpfbreite (222 in Querschnitt).'},
    cabinWidth:{v:5.28, u:'m', st:'doc', src:['img1'], note:'Innenbreite Hauptdeck.'},
    mdHeight:{v:2.45, u:'m', st:'doc', src:['img1'], note:'Innenhöhe Hauptdeck.'},
    ldHeight:{v:1.62, u:'m', st:'doc', src:['img1'], note:'Innenhöhe Unterdeck.'},
    doors:{
      main:{w:3.58, h:2.57, side:'links vorne', st:'ok', src:['airbusF','ahk','airfreight'], note:'141 × 101 in.'},
      lfwd:{w:2.446, h:1.698, side:'rechts vorne', st:'conflict', src:['ahk','airfreight'], note:'airfreight.com nennt ca. 106 × 66 in (2,69 × 1,68 m). Im Training gilt der kleinere Wert.'},
      laft:{w:2.446, h:1.682, side:'rechts hinten', st:'conflict', src:['ahk','img1'], note:'Dein Bild 1 nennt 181 × 167 cm. Im Training gilt 2,446 × 1,682 m (air Hongkong).'},
      bulk:{w:0.950, h:0.637, side:'rechts hinten', st:'conflict', src:['ahk','img1'], note:'Dein Bild 1 nennt 108 × 95 cm.'}
    },
    mtow:{v:170500, u:'kg', st:'ok', src:['ahk','gcc']},
    mlw:{v:140000, u:'kg', st:'doc', src:['ahk']},
    mzfw:{v:130000, u:'kg', st:'ok', src:['airbusF'], note:'Airbus: 286,6 × 1000 lb.'},
    oew:{v:78335, u:'kg', st:'train', src:['gcc'], note:'Das Leergewicht (OEW) ist für jedes Flugzeug anders. Echter Wert steht im Weight and Balance Handbuch.'},
    payload:{v:53000, u:'kg', st:'doc', src:['ahk'], note:'Brutto Nutzlast laut air Hongkong. Rechnerisch begrenzt MZFW minus OEW die Nutzlast.'},
    volMain:{v:306.7, u:'m³', st:'doc', src:['ahk']},
    volFwd:{v:53.69, u:'m³', st:'doc', src:['ahk']},
    volAft:{v:44.74, u:'m³', st:'doc', src:['ahk']},
    volBulk:{v:11.27, u:'m³', st:'conflict', src:['ahk','img1'], note:'Dein Bild 1 nennt 17 m³ für Y und Z.'},
    mdConfig:{st:'ok', src:['airbusF'], note:'Airbus: bis zu 21 Paletten 88 × 125 in nebeneinander oder 15 Paletten 96 × 125 in in einer Reihe, jeweils bis 96 in hoch.'},
    ldConfig:{st:'conflict', src:['airbusF','wiki','ahk'], note:'Airbus: 7 Paletten oder 23 LD3. Wikipedia und dein Bild 4 zeigen 22 LD3. Wo die 23. LD3 steht, ist nicht belegt. Darum zeigt das Modell 22.'},
    cg:{st:'unver', note:'Stationsarme, MAC und Schwerpunktgrenzen liegen nicht verifiziert vor. Jede Schwerpunktrechnung ist ein Trainingsbeispiel ohne Freigabe.'}
  };

  /* Die vier erlaubten ULD Typen. Maße in cm, Gewichte in kg. */
  A.ULD = {
    PAG:{code:'PAG', kind:'pallet', name:'PAG Palette', baseIn:'88 × 125 in', base:{a:223.5, b:317.5}, thick:3.0, color:'#38BDF8',
      tare:{v:110, st:'conflict', src:['dsvPag','swiss','vrrPag'], note:'DSV und Swiss nennen 110 kg, Hersteller 79 bis 94 kg. Echten Wert vom Schild an der Palette nehmen.'},
      mgw:{main:{v:6000, st:'conflict', src:['dsvPag','vrrPag'], note:'DSV nennt 6.000 kg auf dem Hauptdeck, Hersteller 6.804 kg. Im Training gilt 6.000 kg.'},
           lower:{v:4626, st:'ok', src:['dsvPag','swiss']}},
      net:{v:15, st:'train', note:'Gewicht Netz und Gurte frei angenommen.'},
      info:'Grundfläche 223,5 × 317,5 cm (88 × 125 in).'},
    PAJ:{code:'PAJ', kind:'pallet', name:'PAJ Palette', baseIn:'88 × 125 in', base:{a:223.5, b:317.5}, thick:3.0, color:'#C084FC',
      tare:{v:120, st:'conflict', src:['eth','swiss'], note:'Ethiopian nennt 120 kg, Swiss 110 kg (P1P/PAJ). Echten Wert vom Schild nehmen.'},
      mgw:{main:{v:6804, st:'ok', src:['eth','vrrPag'], note:'Ethiopian und Hersteller VRR nennen 6.804 kg (15.000 lb).'},
           lower:{v:4626, st:'ok', src:['swiss']}},
      net:{v:15, st:'train', note:'Gewicht Netz und Gurte frei angenommen.'},
      info:'Gleiche Grundfläche wie PAG, aber eigener Code und eigene Werte. Nie automatisch gleichsetzen.'},
    PMC:{code:'PMC', kind:'pallet', name:'PMC Palette', baseIn:'96 × 125 in', base:{a:243.8, b:317.5}, thick:3.0, color:'#2DD4BF',
      tare:{v:120, st:'conflict', src:['dsvPmc','vrrPmc'], note:'DSV nennt 120 kg, Hersteller 88 bis 102 kg. Echten Wert vom Schild nehmen.'},
      mgw:{main:{v:6804, st:'ok', src:['vrrPmc','dsvPmc'], note:'DSV nennt gerundet 6.800 kg.'},
           lower:{v:4626, st:'conflict', src:['dsvPmc'], note:'DSV nennt 4.626 oder 5.035 kg je nach Flugzeug. Im Training gilt 4.626 kg. Unterdeck Positionen für PMC sind im A300F nicht belegt.'}},
      net:{v:17, st:'train', note:'Gewicht Netz und Gurte frei angenommen.'},
      info:'Grundfläche 243,8 × 317,5 cm (96 × 125 in).'},
    AKE:{code:'AKE', kind:'container', name:'AKE Container (LD3)', baseIn:'LD3', base:{a:156.2, b:153.4}, top:200.6, height:162.6, color:'#818CF8',
      tare:{v:82, st:'conflict', src:['dsvAke','iagAke'], note:'Datenblatt Pengellys/DSV nennt 82 kg. Je nach Bauart (Alu, Verbund) anders. Schild beachten.'},
      mgw:{main:{v:1588, st:'ok', src:['dsvAke','iagAke']}, lower:{v:1588, st:'ok', src:['dsvAke','iagAke']}},
      net:{v:0, st:'ok', note:'Container, Tür statt Netz.'},
      vol:{v:4.3, st:'conflict', note:'Quellen nennen 4,2 bis 4,5 m³.'},
      info:'Boden 156,2 × 153,4 cm, oben 200,6 cm breit, 162,6 cm hoch.'}
  };
  A.ULD_ORDER = ['PAG','PMC','PAJ','AKE'];

  /* Konturen. Querschnitt quer zur Fahrtrichtung der Position.
     len = Maß in Flugzeuglängsrichtung, wid = Maß quer, poly = Punkte [quer, Höhe] in cm.
     Alle Polygone sind konvex. Die Seitenschrägen sind aus der Rumpfform (5,28 m innen) abgeleitet. */
  A.CONTOURS = {
    MD_SBS_L:{name:'Hauptdeck nebeneinander, linke Seite', deck:'main', ulds:['PAG','PAJ'], len:317.5, wid:223.5,
      poly:[[0,0],[223.5,0],[223.5,155],[140,243.8],[0,243.8]], hMax:243.8, outboard:'rechts im Bild',
      st:{h:'ok', shape:'unver'}, note:'Höhe 96 in laut Airbus. Die Schräge außen ist aus der Rumpfform abgeleitet und nicht verifiziert.'},
    MD_SBS_R:{name:'Hauptdeck nebeneinander, rechte Seite', deck:'main', ulds:['PAG','PAJ'], len:317.5, wid:223.5,
      poly:[[0,0],[223.5,0],[223.5,243.8],[83.5,243.8],[0,155]], hMax:243.8, outboard:'links im Bild',
      st:{h:'ok', shape:'unver'}, note:'Höhe 96 in laut Airbus. Die Schräge außen ist aus der Rumpfform abgeleitet und nicht verifiziert.'},
    MD_SR:{name:'Hauptdeck eine Reihe, Mitte', deck:'main', ulds:['PMC'], len:243.8, wid:317.5,
      poly:[[0,0],[317.5,0],[317.5,170],[278.75,208],[38.75,208],[0,170]], hMax:208,
      st:{h:'conflict', shape:'unver'}, note:'Airbus nennt bis 96 in, das air Hongkong Datenblatt 82 in. Im Training gilt 82 in (208 cm).'},
    MD_SR_LOW:{name:'Hauptdeck eine Reihe, hinten niedriger', deck:'main', ulds:['PMC'], len:243.8, wid:317.5,
      poly:[[0,0],[317.5,0],[317.5,125],[285,163],[32.5,163],[0,125]], hMax:163,
      st:{h:'doc', shape:'unver'}, note:'64 in laut air Hongkong Datenblatt.'},
    MD_TAIL:{name:'Hauptdeck Heck, einzeln', deck:'main', ulds:['PAG','PAJ'], len:223.5, wid:317.5,
      poly:[[0,0],[317.5,0],[317.5,120],[285,163],[32.5,163],[0,120]], hMax:163,
      st:{h:'doc', shape:'unver'}, note:'64 in laut air Hongkong Datenblatt.'},
    MD_TAIL56:{name:'Hauptdeck ganz hinten', deck:'main', ulds:['PAG','PAJ'], len:223.5, wid:317.5,
      poly:[[0,0],[317.5,0],[317.5,105],[285,142],[32.5,142],[0,105]], hMax:142,
      st:{h:'doc', shape:'unver'}, note:'56 in laut air Hongkong Datenblatt.'},
    MD_FRONT:{name:'Hauptdeck vorne, einzeln (nur Plan Bild 3)', deck:'main', ulds:['PAG','PAJ'], len:223.5, wid:317.5,
      poly:[[0,0],[317.5,0],[317.5,170],[278.75,208],[38.75,208],[0,170]], hMax:208,
      st:{h:'unver', shape:'unver'}, note:'Für diese Position liegt keine Kontur vor. Im Training gilt 208 cm.'},
    LD_PAL:{name:'Unterdeck Palette', deck:'lower', ulds:['PAG','PAJ'], len:223.5, wid:317.5,
      poly:[[0,0],[317.5,0],[317.5,120],[290,162],[27.5,162],[0,120]], hMax:162,
      st:{h:'doc', shape:'unver'}, note:'162 cm laut deinem Bild 1. Die Eckschrägen sind nicht verifiziert.'},
    AKE:{name:'AKE Innenraum', deck:'lower', ulds:['AKE'], len:149.4, wid:200.6, container:true,
      outer:[[0,0],[156.2,0],[200.6,64],[200.6,162.6],[0,162.6]],
      poly:[[2,0],[154.2,0],[198.6,64],[198.6,158.6],[2,158.6]], hMax:158.6,
      st:{h:'train', shape:'unver'}, note:'Außenmaße geprüft. Der Knick der Schräge (64 cm) und die Wandstärke (2 cm) sind Trainingsannahmen.'}
  };

  /* Trainingsannahmen für Prüfungen. Im echten Betrieb gelten Handbuch und Schild. */
  A.TRAIN = {
    floorLoad:{v:976, u:'kg/m²', st:'train', note:'Grenze Flächenlast je Packstück frei angenommen (etwa 200 lb/ft²). Echte Werte stehen im Weight and Balance Handbuch.'},
    support:{v:0.75, st:'train', note:'Mindestens 75 % der Unterseite müssen aufliegen.'},
    cgOffset:{v:0.10, st:'train', note:'Schwerpunkt der Ladung höchstens 10 % von der Palettenmitte entfernt.'},
    spreader:{v:12, u:'kg/m²', st:'train', note:'Gewicht Lastverteilplatte aus Holz.'},
    strap:{v:1.2, u:'kg', st:'train'}
  };

  A.PACK = ['Karton','Kiste','Palette (Holz)','Fass','Sack','Rolle','Gitterbox','Lose Teile'];

  /* AWB Nummer: 3 Ziffern Präfix + 8 Ziffern Seriennummer, letzte Ziffer = erste 7 Ziffern mod 7. */
  A.awbCheck = function (s) {
    const d = String(s || '').replace(/\D/g, '');
    if (!d) return {ok:false, empty:true, msg:'AWB fehlt'};
    if (d.length !== 11) return {ok:false, msg:'AWB braucht 11 Ziffern (3 Präfix und 8 Seriennummer)'};
    const ser = d.slice(3, 10), chk = +d[10];
    if (+ser % 7 !== chk) return {ok:false, msg:'Prüfziffer falsch, erwartet ' + (+ser % 7)};
    return {ok:true, fmt:d.slice(0, 3) + '-' + d.slice(3), msg:'AWB gültig'};
  };
})(window.A300F);
