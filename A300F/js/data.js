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

/* ---------- Erweiterung: weitere ULD Typen, Konturcodes, Flugzeugtypen ---------- */
(function (A) {
  'use strict';
  Object.assign(A.SRC, {
    envRkn:{name:'Envirotainer, RKN e1 Datenblatt', url:'https://www.envirotainer.com/4a3d64/siteassets/documents/solutions/pallets/e-tech/envirotainer-rkn-e1-container-tech-specs.pdf'},
    envRap:{name:'Envirotainer, RAP e2 Datenblatt (Lufthansa Cargo)', url:'https://www.lufthansa-cargo.com/documents/20184/26391/Envirotainer_TechSpecRAPe2_1_.pdf/e4be541d-0ae5-4766-98e3-858d38fa2052'},
    envRlp:{name:'Envirotainer, Releye RLP Datenblatt', url:'https://www.envirotainer.com/4ad806/siteassets/documents/solutions/pallets/releye/envirotainer-releyer-rlp-container-tech-specs.pdf'},
    swissCont:{name:'Swiss WorldCargo, Container', url:'https://www.swissworldcargo.com/en/network_fleet/fleet_ulds/ulds/containers'},
    lhBro:{name:'Lufthansa Cargo, Paletten und Container', url:'https://lufthansa-cargo.com/documents/d/guest/brochure_pallets_containers_and_fleet'},
    iagUld:{name:'IAG Cargo, ULDs', url:'https://www.iagcargo.com/en/fleet/ulds/'},
    aaCont:{name:'American Airlines Cargo, Container', url:'https://www.aacargo.com/ship/aircraft-containers.html'},
    cpQ:{name:'Cargo Planner, ULD Typen', url:'https://cargo-planner.com/guides/uld-types-and-dimensions/'},
    smQ:{name:'Sizemarker, ULD Höhen', url:'https://www.sizemarker.com/blog/air-freight-maximum-dimensions'},
    sky777:{name:'Emirates SkyCargo, Flotte', url:'https://www.skycargo.com:443/media/2380/emirates-skycargo_fleet_info_doc.pdf'},
    af777:{name:'airfreight.com, 777-200F', url:'https://www.airfreight.com/air-charter/boeing-777-200f'},
    rft777:{name:'Ready for Takeoff, 777F', url:'https://readyfortakeoffbook.com/blogs/aircraft-type/boeing-777f'},
    aiA320:{name:'Air India Cargo, Flotte', url:'https://cargo.airindia.com/in/en/about-us/fleet-ulds.html'},
    etA320:{name:'Etihad, Cargo Hold Information', url:'https://www.etihad.com/content/dam/eag/etihadairways/etihadcom/2025/pdf/medical/cargo-hold-information-36.pdf'},
    uralA319:{name:'Ural Airlines Cargo, A319', url:'https://cargo.uralairlines.ru/en/planes/airbus-a319'}
  });
  Object.assign(A.ULD, {
    AKH:{code:'AKH', kind:'container', name:'AKH Container (LD3-45)', baseIn:'LD3-45', base:{a:156.2, b:153.4}, top:243.8, height:114.3, color:'#A3E635',
      tare:{v:82, st:'conflict', src:['swissCont','lhBro','iagUld'], note:'Swiss 82 kg, Lufthansa 84 kg, IAG 76 kg.'},
      mgw:{main:{v:1134, st:'conflict', src:['swissCont','lhBro'], note:'Swiss 1.134 kg (A320), Lufthansa 1.588 kg. Im Training gilt 1.134 kg.'}, lower:{v:1134, st:'conflict', src:['swissCont','lhBro'], note:'Swiss 1.134 kg (A320), Lufthansa 1.588 kg. Im Training gilt 1.134 kg.'}},
      net:{v:0, st:'ok'}, info:'Boden 156,2 × 153,4 cm, 45 in (114,3 cm) hoch. Für A319, A320 und A321.'},
    RKN:{code:'RKN', kind:'container', name:'RKN Kühlcontainer (Envirotainer e1)', baseIn:'LD3', base:{a:156.2, b:153.4}, top:200.0, height:162.0, color:'#22D3EE',
      tare:{v:635, st:'ok', src:['envRkn'], note:'Kann sich nach Reparaturen ändern.'},
      mgw:{main:{v:1588, st:'ok', src:['envRkn']}, lower:{v:1588, st:'ok', src:['envRkn']}},
      net:{v:0, st:'ok'}, info:'Außen 200 × 153,5 × 162 cm, innen 134 × 131,9 × 131,5 cm (2,3 m³). Aktive Kühlung.'},
    RAP:{code:'RAP', kind:'container', name:'RAP Kühlcontainer (Envirotainer e2)', baseIn:'88 × 125 in', base:{a:223.5, b:317.5}, height:162.6, color:'#F97316',
      tare:{v:1100, st:'ok', src:['envRap','swissCont']},
      mgw:{main:{v:4626, st:'conflict', src:['envRap','swissCont','aaCont'], note:'Hersteller 6.033 kg, Swiss 4.626 kg, American 5.034 kg. Im Training gilt 4.626 kg.'}, lower:{v:4626, st:'conflict', src:['envRap','swissCont','aaCont'], note:'Hersteller 6.033 kg, Swiss 4.626 kg, American 5.034 kg. Im Training gilt 4.626 kg.'}},
      net:{v:0, st:'ok'}, info:'Außen 317,5 × 223,5 × 162,6 cm, innen 246,5 × 205,5 × 126 cm (6,38 m³). Aktive Kühlung.'},
    RLP:{code:'RLP', kind:'container', name:'RLP Kühlcontainer (Envirotainer Releye)', baseIn:'60,4 × 125 in', base:{a:153.4, b:317.5}, height:162.6, color:'#E879F9',
      tare:{v:880, st:'ok', src:['envRlp']},
      mgw:{main:{v:3175, st:'ok', src:['envRlp']}, lower:{v:3175, st:'ok', src:['envRlp']}},
      net:{v:0, st:'ok'}, info:'Außen 317,5 × 153,4 × 162,6 cm, innen 245,7 × 135,4 × 132 cm (4,4 m³). Platz für 3 Paletten.'}
  });
  A.ULD_ORDER = ['PAG','PMC','PAJ','AKE','AKH','RKN','RAP','RLP'];
  const LD_OUT = [[0,0],[317.5,0],[317.5,120],[290,162.6],[27.5,162.6],[0,120]];
  Object.assign(A.CONTOURS, {
    AKH:{name:'AKH Innenraum', deck:'lower', ulds:['AKH'], len:149.4, wid:243.8, container:true,
      outer:[[43.8,0],[200,0],[243.8,54],[243.8,114.3],[0,114.3],[0,54]], poly:[[45.8,0],[198,0],[241.8,54],[241.8,110.3],[2,110.3],[2,54]], hMax:110.3,
      st:{h:'conflict', shape:'unver'}, note:'Nennhöhe 45 in (114,3 cm), Swiss nennt 111 cm. Schräge und Wandstärke sind Trainingsannahmen.'},
    RKN:{name:'RKN Kühlraum', deck:'lower', ulds:['RKN'], len:131.9, wid:200.6, container:true,
      outer:[[0,0],[156.2,0],[200.6,64],[200.6,162.6],[0,162.6]], poly:[[33,0],[167,0],[167,131.5],[33,131.5]], hMax:131.5,
      st:{h:'ok', shape:'ok'}, note:'Innenmaße laut Envirotainer Datenblatt.'},
    RAP:{name:'RAP Kühlraum', deck:'lower', ulds:['RAP'], len:205.5, wid:317.5, container:true,
      outer:LD_OUT, poly:[[35.5,0],[282,0],[282,126],[35.5,126]], hMax:126,
      st:{h:'ok', shape:'ok'}, note:'Innenmaße laut Envirotainer Datenblatt.'},
    RLP:{name:'RLP Kühlraum', deck:'lower', ulds:['RLP'], len:135.4, wid:317.5, container:true,
      outer:LD_OUT, poly:[[35.9,0],[281.6,0],[281.6,132],[35.9,132]], hMax:132,
      st:{h:'ok', shape:'conflict'}, note:'Innenlänge laut Datenblatt 2.475 oder 2.457 mm. Im Training gilt 245,7 cm.'},
    Q6_L:{name:'Q6, Hauptdeck nebeneinander links (777F)', deck:'main', ulds:['PMC'], len:317.5, wid:243.8,
      poly:[[0,0],[243.8,0],[243.8,175],[150,243.8],[0,243.8]], hMax:243.8, code:'Q6',
      st:{h:'ok', shape:'unver'}, note:'Q6 heißt 96 in (243,8 cm). Schräge außen nicht verifiziert.'},
    Q6_R:{name:'Q6, Hauptdeck nebeneinander rechts (777F)', deck:'main', ulds:['PMC'], len:317.5, wid:243.8,
      poly:[[0,0],[243.8,0],[243.8,243.8],[93.8,243.8],[0,175]], hMax:243.8, code:'Q6',
      st:{h:'ok', shape:'unver'}, note:'Q6 heißt 96 in (243,8 cm). Schräge außen nicht verifiziert.'},
    Q7_L:{name:'Q7, Hauptdeck nebeneinander links (777F)', deck:'main', ulds:['PMC'], len:317.5, wid:243.8,
      poly:[[0,0],[243.8,0],[243.8,200],[140,299.7],[0,299.7]], hMax:299.7, code:'Q7',
      st:{h:'ok', shape:'unver'}, note:'Q7 heißt 118 in (299,7 cm), nur auf großen Frachtern wie 777F. Passt nie in A300F, A319 oder A320.'},
    Q7_R:{name:'Q7, Hauptdeck nebeneinander rechts (777F)', deck:'main', ulds:['PMC'], len:317.5, wid:243.8,
      poly:[[0,0],[243.8,0],[243.8,299.7],[103.8,299.7],[0,200]], hMax:299.7, code:'Q7',
      st:{h:'ok', shape:'unver'}, note:'Q7 heißt 118 in (299,7 cm), nur auf großen Frachtern wie 777F. Passt nie in A300F, A319 oder A320.'},
    Q6_N:{name:'Q6, Hauptdeck vorne in der Mitte (777F)', deck:'main', ulds:['PMC'], len:243.8, wid:317.5,
      poly:[[0,0],[317.5,0],[317.5,170],[268.75,243.8],[48.75,243.8],[0,170]], hMax:243.8, code:'Q6',
      st:{h:'ok', shape:'unver'}, note:'Q6 heißt 96 in (243,8 cm). Form vorne nicht verifiziert.'},
    LD_PMC:{name:'Unterdeck PMC (777F)', deck:'lower', ulds:['PMC'], len:243.8, wid:317.5,
      poly:[[0,0],[317.5,0],[317.5,115],[285,162.6],[32.5,162.6],[0,115]], hMax:162.6, code:'LD',
      st:{h:'conflict', shape:'unver'}, note:'Quellen nennen 160 oder 162,6 cm (64 in) für Unterdeck Paletten.'}
  });
  A.CONTOURS.LD_PAL.ulds = ['PAG','PAJ'];
  /* Welche Kontur gilt für diese ULD auf dieser Position? */
  A.contourFor = function (pos, uld) {
    const U = A.ULD[uld];
    if (U && U.kind === 'container') return uld;
    if (pos && pos.contour && typeof pos.contour === 'object') return pos.contour[uld] || null;
    return pos ? pos.contour : null;
  };

  const AC = A.AIRCRAFT, W = (v, st, src, note) => ({v, st, src, note});
  /* Flugzeugtypen. Geometrie in m, Mitte Rumpf bei y = cy, Boden bei y = -5. */
  A.FLEET = {
    A300F:{id:'A300F', short:'A300F', name:'Airbus A300-600F', L:54.08, span:44.84, H:16.5, R:2.82, cy:0, mainOff:-0.27, lowOff:-2.10, cargoMain:true,
      noseLen:5.4, tailStart:44.6, barrier:5.72, wingBox:[18.2, 26.8], tipLe:28.8, hs:22.42,
      eng:{x:18.4, z:9.25, len:5.8}, stab:{tipLe:51.7, span:8.1}, gear:{nose:5.0, main:25.4, z:4.6},
      doors:Object.assign({}, AC.doors, {main:Object.assign({x0:8.3}, AC.doors.main), lfwd:Object.assign({x0:8.6}, AC.doors.lfwd), laft:Object.assign({x0:32.0}, AC.doors.laft), bulk:Object.assign({x0:35.5}, AC.doors.bulk)}),
      mtow:AC.mtow, mlw:AC.mlw, mzfw:AC.mzfw, oew:AC.oew, payload:AC.payload, src:['airbus','airbusF']},
    B777F:{id:'B777F', short:'777F', name:'Boeing 777F', L:63.73, span:64.80, H:18.6, R:3.1, cy:0.8, mainOff:-0.45, lowOff:-2.35, cargoMain:true,
      noseLen:6.6, tailStart:51.5, barrier:6.3, wingBox:[24.6, 33.6], tipLe:42.0, hs:32.4,
      wing:{le:23.0, chord:13.5, tipLe:42.0, tipChord:3.0, y:-1.9, dih:0.10},
      eng:{x:21.0, z:9.6, r:1.72, len:7.3, y:-3.23}, stab:{x0:55.5, chord:6.0, tipLe:60.2, tipChord:2.4, span:10.7, y:1.0},
      fin:{x0:51.8, tipLe:59.5, tipChord:3.6}, gear:{nose:7.0, main:31.0, z:5.5, wr:0.66, six:true},
      doors:{main:{x0:42.0, w:3.73, h:3.05, side:'links hinten', st:'conflict', src:['rft777','af777'], note:'Quellen nennen 3,71 bis 3,74 × 3,05 bis 3,15 m.'},
             lfwd:{x0:9.6, w:2.69, h:1.70, side:'rechts vorne', st:'unver', note:'Lage und Maß nicht im Hersteller Dokument geprüft.'},
             laft:{x0:40.6, w:2.69, h:1.70, side:'rechts hinten', st:'unver', note:'Lage und Maß nicht im Hersteller Dokument geprüft.'},
             bulk:{x0:45.6, w:0.91, h:1.19, side:'rechts hinten', st:'unver', note:'Lage und Maß nicht geprüft.'}},
      mtow:W(347815, 'unver', [], 'Aus Fachwissen, nicht im Boeing Dokument geprüft.'), mlw:W(260816, 'unver', [], 'Aus Fachwissen, nicht geprüft.'), mzfw:W(248115, 'unver', [], 'Aus Fachwissen, nicht geprüft.'),
      oew:W(144379, 'train', [], 'Beispielwert. Echter Wert aus dem Weight and Balance Handbuch.'), payload:W(102010, 'unver', [], 'Aus Fachwissen, nicht geprüft.'),
      plan:'27 Paletten 96 × 125 in auf dem Hauptdeck, 10 Paletten im Unterdeck', planSt:'ok', planSrc:['sky777','af777','rft777'], src:['sky777','af777','rft777']},
    A320:{id:'A320', short:'A320', name:'Airbus A320', L:37.57, span:35.80, H:11.76, R:1.975, cy:-1.8, mainOff:-0.15, lowOff:-1.55, cargoMain:false,
      noseLen:4.0, tailStart:28.6, barrier:0, wingBox:[11.6, 17.2], tipLe:19.9, hs:17.9,
      wing:{le:12.4, chord:6.2, tipLe:19.9, tipChord:1.6, y:-1.0, dih:0.10},
      eng:{x:11.0, z:5.75, r:0.95, len:4.0, y:-1.75}, stab:{x0:31.8, chord:3.4, tipLe:34.5, tipChord:1.5, span:6.2, y:0.4},
      fin:{x0:28.8, tipLe:34.6, tipChord:2.3}, gear:{nose:5.1, main:15.6, z:3.8, wr:0.57},
      doors:{lfwd:{x0:6.6, w:1.82, h:1.24, side:'rechts vorne', st:'ok', src:['aiA320','etA320']},
             laft:{x0:21.6, w:1.82, h:1.23, side:'rechts hinten', st:'ok', src:['aiA320','etA320']},
             bulk:{x0:24.6, w:0.95, h:0.77, side:'rechts hinten', st:'conflict', src:['aiA320','etA320'], note:'Air India 0,95 × 0,76 m, Etihad 0,95 × 0,77 m.'}},
      fwdX:6.3, aftX:17.6, nF:3, nA:4,
      mtow:W(78000, 'unver', [], 'Je nach Variante 73.500 bis 79.000 kg. Nicht geprüft.'), mlw:W(66000, 'unver', [], 'Je nach Variante. Nicht geprüft.'), mzfw:W(62500, 'unver', [], 'Je nach Variante. Nicht geprüft.'),
      oew:W(42600, 'train', [], 'Beispielwert.'), payload:W(19900, 'unver', [], 'MZFW minus OEW, nur Beispiel.'),
      plan:'7 AKH (3 vorne, 4 hinten), Hauptdeck nur Passagiere', planSt:'ok', planSrc:['wiki','lhBro'], src:['wiki','aiA320','etA320']},
    A319:{id:'A319', short:'A319', name:'Airbus A319', L:33.84, span:35.80, H:11.76, R:1.975, cy:-1.8, mainOff:-0.15, lowOff:-1.55, cargoMain:false,
      noseLen:4.0, tailStart:24.9, barrier:0, wingBox:[10.0, 15.3], tipLe:18.1, hs:17.9,
      wing:{le:10.6, chord:6.2, tipLe:18.1, tipChord:1.6, y:-1.0, dih:0.10},
      eng:{x:9.3, z:5.75, r:0.95, len:4.0, y:-1.75}, stab:{x0:28.1, chord:3.4, tipLe:30.8, tipChord:1.5, span:6.2, y:0.4},
      fin:{x0:25.1, tipLe:30.9, tipChord:2.3}, gear:{nose:5.1, main:13.4, z:3.8, wr:0.57},
      doors:{lfwd:{x0:6.6, w:1.82, h:1.23, side:'rechts vorne', st:'conflict', src:['aiA320','uralA319'], note:'Air India 1,82 m breit, Ural Airlines 1,65 m.'},
             laft:{x0:17.2, w:1.82, h:1.23, side:'rechts hinten', st:'conflict', src:['aiA320','uralA319'], note:'Air India 1,82 m breit, Ural Airlines 1,71 m.'},
             bulk:{x0:19.9, w:0.95, h:0.76, side:'rechts hinten', st:'unver', note:'Wie A320 angenommen.'}},
      fwdX:6.3, aftX:16.0, nF:2, nA:2,
      mtow:W(75500, 'unver', [], 'Je nach Variante. Nicht geprüft.'), mlw:W(62500, 'unver', [], 'Je nach Variante. Nicht geprüft.'), mzfw:W(58500, 'unver', [], 'Je nach Variante. Nicht geprüft.'),
      oew:W(40800, 'train', [], 'Beispielwert.'), payload:W(17700, 'unver', [], 'MZFW minus OEW, nur Beispiel.'),
      plan:'4 AKH (2 vorne, 2 hinten), Hauptdeck nur Passagiere', planSt:'ok', planSrc:['wiki'], src:['wiki','aiA320','uralA319']}
  };
  A.FLEET_ORDER = ['A300F','B777F','A320','A319'];
  A.curAC = A.FLEET.A300F;
})(window.A300F);
