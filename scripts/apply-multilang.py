#!/usr/bin/env python3
"""
Apply multi-language productName + productDescription to the 9 demo product
seed files in extensions/eu/{textile,battery,ppwr}/examples/.

Each language uses its ISO 639-1 code (BCP 47): en, de, fr, es, nl, da, pl,
sv, no, fi, it. Country codes (dk/se) intentionally NOT used — JSON-LD's
@language tag is a language code, not a country code.

The script rewrites `productName` and any of (`productDescription`,
`gs1:productDescription`) to a JSON-LD array of language-tagged value nodes,
preserving every other field in the seed.

Translations are drafted by the author and clearly marked when approximate;
review and refine in a follow-up PR. The point here is the rendering shape,
not marketing-grade copy.

Run:
    python3 scripts/apply-multilang.py

Output:
    Mutates extensions/eu/{textile,battery,ppwr}/examples/*.jsonld in place.
    Pretty-printed JSON (2-space indent), trailing newline.
"""

from __future__ import annotations

import json
import pathlib
import sys

LANGS = ["en", "de", "fr", "es", "nl", "da", "pl", "sv", "no", "fi", "it"]

PRODUCTS: dict[str, dict[str, dict[str, str]]] = {
    "09521000001428": {
        "file": "extensions/eu/textile/examples/garment-product.jsonld",
        "name": {
            "en": "Alpine Pro Winter Jacket — Navy",
            "de": "Alpine Pro Winterjacke — Marineblau",
            "fr": "Veste d'hiver Alpine Pro — Bleu marine",
            "es": "Chaqueta de invierno Alpine Pro — Azul marino",
            "nl": "Alpine Pro winterjas — Marineblauw",
            "da": "Alpine Pro vinterjakke — Marineblå",
            "pl": "Kurtka zimowa Alpine Pro — Granatowa",
            "sv": "Alpine Pro vinterjacka — Marinblå",
            "no": "Alpine Pro vinterjakke — Marineblå",
            "fi": "Alpine Pro talvitakki — Laivastonsininen",
            "it": "Giacca invernale Alpine Pro — Blu navy",
        },
        "description": {
            "en": "Water-resistant insulated winter jacket with recycled polyester shell and responsibly sourced down filling. Designed for durability and warmth in alpine conditions.",
            "de": "Wasserabweisende, isolierte Winterjacke mit Außenstoff aus recyceltem Polyester und verantwortungsvoll gewonnener Daunenfüllung. Entwickelt für Langlebigkeit und Wärme im alpinen Einsatz.",
            "fr": "Veste d'hiver isolée et déperlante, coque en polyester recyclé et garnissage en duvet issu de filières responsables. Conçue pour la durabilité et la chaleur en haute montagne.",
            "es": "Chaqueta de invierno aislante e impermeable con tejido exterior de poliéster reciclado y relleno de plumón de origen responsable. Diseñada para ofrecer calidez y resistencia en condiciones alpinas.",
            "nl": "Waterafstotende, geïsoleerde winterjas met buitenstof van gerecycled polyester en verantwoord gewonnen donsvulling. Gemaakt voor duurzaamheid en warmte in alpiene omstandigheden.",
            "da": "Vandafvisende, isoleret vinterjakke med yderstof af genbrugspolyester og ansvarligt indhentet dunfyld. Designet til varme og holdbarhed under alpine forhold.",
            "pl": "Wodoodporna, ocieplana kurtka zimowa z poszyciem z poliestru z recyklingu i wypełnieniem z odpowiedzialnie pozyskiwanego puchu. Zaprojektowana z myślą o trwałości i cieple w warunkach alpejskich.",
            "sv": "Vattenavvisande, isolerad vinterjacka med yttertyg av återvunnen polyester och ansvarsfullt framtagen dunfyllning. Konstruerad för värme och hållbarhet under alpina förhållanden.",
            "no": "Vannavstøtende, isolert vinterjakke med yttermateriale i resirkulert polyester og ansvarlig hentet dunfyll. Designet for varme og slitestyrke i alpine forhold.",
            "fi": "Vedenpitävä, eristetty talvitakki, jonka päällikangas on kierrätettyä polyesteriä ja täyte vastuullisesti hankittua untuvaa. Suunniteltu kestävyyteen ja lämpöön alppiolosuhteissa.",
            "it": "Giacca invernale isolante e impermeabile con tessuto esterno in poliestere riciclato e imbottitura in piuma di provenienza responsabile. Progettata per garantire calore e durata in condizioni alpine.",
        },
    },
    "09521000002159": {
        "file": "extensions/eu/textile/examples/footwear-product.jsonld",
        "name": {
            "en": "EcoStride Trail Running Shoe — Forest Green",
            "de": "EcoStride Trail-Laufschuh — Waldgrün",
            "fr": "Chaussure de trail EcoStride — Vert forêt",
            "es": "Zapatilla de trail EcoStride — Verde bosque",
            "nl": "EcoStride trailschoen — Bosgroen",
            "da": "EcoStride trailløbesko — Skovgrøn",
            "pl": "But do biegów terenowych EcoStride — Leśna zieleń",
            "sv": "EcoStride trailrunningsko — Skogsgrön",
            "no": "EcoStride traillesko — Skoggrønn",
            "fi": "EcoStride polkujuoksukenkä — Metsänvihreä",
            "it": "Scarpa da trail running EcoStride — Verde foresta",
        },
        "description": {
            "en": "Lightweight trail running shoe with recycled upper mesh, chrome-free leather accents, and bio-based rubber outsole. Designed for trail performance and circular end-of-life.",
            "de": "Leichter Trail-Laufschuh mit recyceltem Obermaterial, chromfreien Lederapplikationen und biobasierter Gummisohle. Konzipiert für Trail-Performance und kreislauffähiges Lebensende.",
            "fr": "Chaussure de trail légère avec tige en maille recyclée, empiècements en cuir sans chrome et semelle en caoutchouc biosourcé. Conçue pour la performance en trail et la circularité en fin de vie.",
            "es": "Zapatilla de trail ligera con malla superior reciclada, refuerzos de cuero sin cromo y suela de caucho de base biológica. Pensada para el rendimiento en pista y la circularidad al final de su vida útil.",
            "nl": "Lichtgewicht trailschoen met gerecyclede bovenmesh, chroomvrije leren accenten en biobased rubberen buitenzool. Ontworpen voor trailprestaties en circulariteit aan het einde van de levensduur.",
            "da": "Letvægts trailløbesko med overdel af genbrugsmesh, kromfri læderdetaljer og bio-baseret gummisål. Designet til trailpræstation og cirkulær end-of-life.",
            "pl": "Lekki but do biegania w terenie z górą z siatki z recyklingu, akcentami ze skóry bezchromowej i podeszwą z gumy biopochodnej. Zaprojektowany pod kątem trailowej wydajności i obiegu zamkniętego.",
            "sv": "Lättviktig trailrunningsko med ovandel av återvunnen mesh, kromfria läderdetaljer och biobaserad gummiyttersula. Konstruerad för trailprestanda och cirkulär livslängd.",
            "no": "Lett traillesko med overdel av resirkulert mesh, kromfrie lærdetaljer og biobasert gummisåle. Designet for trailytelse og sirkulær livssyklus.",
            "fi": "Kevyt polkujuoksukenkä, jonka päällinen on kierrätettyä mesh-kangasta, krominvapaita nahkayksityiskohtia ja biopohjainen kumipohja. Suunniteltu polkujuoksun suorituskykyyn ja kiertotaloudelle.",
            "it": "Scarpa da trail running leggera con tomaia in mesh riciclato, dettagli in pelle senza cromo e suola in gomma a base biologica. Progettata per le prestazioni sul trail e la circolarità a fine vita.",
        },
    },
    "09521000004207": {
        "file": "extensions/eu/textile/examples/garment-set-itip.jsonld",
        "name": {
            "en": "Classic Business Suit — Charcoal (2-piece)",
            "de": "Klassischer Business-Anzug — Anthrazit (zweiteilig)",
            "fr": "Costume d'affaires classique — Anthracite (2 pièces)",
            "es": "Traje clásico de oficina — Antracita (2 piezas)",
            "nl": "Klassiek zakelijk kostuum — Antraciet (tweedelig)",
            "da": "Klassisk forretningsjakkesæt — Koksgrå (todelt)",
            "pl": "Klasyczny garnitur biznesowy — Grafitowy (2-częściowy)",
            "sv": "Klassisk affärskostym — Antracit (tvådelad)",
            "no": "Klassisk forretningsdress — Antrasitt (todelt)",
            "fi": "Klassinen liikemiehen puku — Antrasiitti (kaksiosainen)",
            "it": "Abito classico da uomo — Antracite (2 pezzi)",
        },
        "description": {
            "en": "Two-piece tailored wool suit with subtle pinstripe, single-breasted notch-lapel jacket and matching flat-front trousers. Jacket and trousers are linked via GS1 AI 8026 (ITIP) so the set is tracked as one trade item.",
            "de": "Zweiteiliger, taillierter Wollanzug mit dezentem Nadelstreifen, einreihiger Sakko mit Kerblapen und passende Hose ohne Bundfalten. Sakko und Hose sind über GS1 AI 8026 (ITIP) verknüpft, sodass das Set als eine Handelseinheit erfasst wird.",
            "fr": "Costume deux pièces ajusté en laine à fines rayures discrètes, veste à boutonnage simple à revers crantés et pantalon à pinces plates assorti. La veste et le pantalon sont liés via GS1 AI 8026 (ITIP), de sorte que l'ensemble est suivi comme une seule unité commerciale.",
            "es": "Traje sastre de lana de dos piezas con sutil raya diplomática, chaqueta cruzada de solapa de pico y pantalón de pinzas a juego. La chaqueta y el pantalón están vinculados mediante GS1 AI 8026 (ITIP), por lo que el conjunto se rastrea como una sola unidad comercial.",
            "nl": "Tweedelig getailleerd wollen kostuum met subtiele krijtstreep, enkelrijige jas met kerflapel en bijpassende pantalon zonder plooien. Jas en pantalon zijn gekoppeld via GS1 AI 8026 (ITIP), zodat de set als één handelsartikel wordt gevolgd.",
            "da": "Todelt skræddersyet uldjakkesæt med diskret nålestribe, enkeltradet jakke med klassisk revers og matchende lige bukser. Jakke og bukser er forbundet via GS1 AI 8026 (ITIP), så sættet spores som én handelsenhed.",
            "pl": "Dwuczęściowy wełniany garnitur szyty na miarę z dyskretną cienką prążkową fakturą, jednorzędowa marynarka z klapami i pasujące spodnie bez zakładek. Marynarka i spodnie są powiązane przez GS1 AI 8026 (ITIP), dzięki czemu komplet jest śledzony jako jedna jednostka handlowa.",
            "sv": "Tvådelad skräddarsydd ullkostym med diskret kritrand, enkelknäppt kavaj med hackad revär och matchande raka byxor. Kavaj och byxor är länkade via GS1 AI 8026 (ITIP) så att uppsättningen spåras som en handelsenhet.",
            "no": "Todelt skreddersydd ulldress med diskret nålestripe, enkeltspent jakke med hakk-revers og matchende rette bukser. Jakke og bukse er knyttet sammen via GS1 AI 8026 (ITIP) slik at settet spores som én handelsenhet.",
            "fi": "Kaksiosainen räätälöity villapuku, jossa hillitty raitakuvio, yksirivinen lovikäänteinen pikkutakki ja yhteensopivat suorat housut. Pikkutakki ja housut on linkitetty GS1 AI 8026 (ITIP) -tunnisteella, joten setti jäljitetään yhtenä kauppanimikkeenä.",
            "it": "Abito sartoriale due pezzi in lana con discreto gessato, giacca monopetto a revers a lancia e pantaloni dritti coordinati. Giacca e pantaloni sono collegati tramite GS1 AI 8026 (ITIP), così l'insieme viene tracciato come un'unica unità commerciale.",
        },
    },
    "09521001001380": {
        "file": "extensions/eu/textile/examples/hometextile-bedlinen.jsonld",
        "name": {
            "en": "Casa Lina Organic Cotton Bed Linen Set — duvet cover + pillowcase, 200×220 cm",
            "de": "Casa Lina Bio-Baumwoll-Bettwäsche-Set — Bettbezug + Kissenbezug, 200×220 cm",
            "fr": "Parure de lit Casa Lina en coton bio — housse de couette + taie d'oreiller, 200×220 cm",
            "es": "Juego de cama Casa Lina de algodón orgánico — funda nórdica + funda de almohada, 200×220 cm",
            "nl": "Casa Lina dekbedovertrekset van biologisch katoen — dekbedovertrek + kussensloop, 200×220 cm",
            "da": "Casa Lina sengetøjssæt i økologisk bomuld — dynebetræk + pudebetræk, 200×220 cm",
            "pl": "Pościel Casa Lina z bawełny organicznej — poszwa na kołdrę + poszewka na poduszkę, 200×220 cm",
            "sv": "Casa Lina sängklädesset i ekologisk bomull — påslakan + örngott, 200×220 cm",
            "no": "Casa Lina sengetøysett i økologisk bomull — dynetrekk + putetrekk, 200×220 cm",
            "fi": "Casa Lina luomupuuvillaiset vuodevaatteet — pussilakana + tyynyliina, 200×220 cm",
            "it": "Set di biancheria da letto Casa Lina in cotone biologico — copripiumone + federa, 200×220 cm",
        },
        "description": {
            "en": "Two-piece bed linen set in 100% GOTS-certified organic cotton percale, woven for high durability and laundered to OEKO-TEX Class I (skin contact). Designed for repair and return at end of life.",
            "de": "Zweiteiliges Bettwäsche-Set aus 100 % GOTS-zertifiziertem Bio-Baumwoll-Perkal, robust gewebt und nach OEKO-TEX Klasse I (Hautkontakt) gewaschen. Konzipiert für Reparatur und Rücknahme am Lebensende.",
            "fr": "Parure de lit deux pièces en percale de coton bio certifié GOTS à 100 %, tissée pour une grande durabilité et lavée selon la norme OEKO-TEX Classe I (contact peau). Conçue pour la réparation et la reprise en fin de vie.",
            "es": "Juego de cama de dos piezas en percal de algodón orgánico 100 % certificado GOTS, tejido para gran durabilidad y lavado según OEKO-TEX Clase I (contacto con la piel). Diseñado para la reparación y la devolución al final de su vida útil.",
            "nl": "Tweedelig beddengoedset in 100% GOTS-gecertificeerd biologisch katoenen percal, geweven voor hoge duurzaamheid en gewassen volgens OEKO-TEX klasse I (huidcontact). Ontworpen voor reparatie en retourname aan het einde van de levensduur.",
            "da": "Todelt sengetøjssæt i 100 % GOTS-certificeret økologisk bomuldspercale, vævet til høj holdbarhed og vasket efter OEKO-TEX klasse I (hudkontakt). Designet til reparation og tilbagetagning ved end-of-life.",
            "pl": "Dwuczęściowy zestaw pościeli z 100% perkalu z bawełny organicznej z certyfikatem GOTS, utkany dla wysokiej trwałości i wyprany zgodnie z OEKO-TEX klasy I (kontakt ze skórą). Zaprojektowany pod kątem napraw i zwrotów po zakończeniu użytkowania.",
            "sv": "Tvådelat sängklädesset i 100 % GOTS-certifierad ekologisk bomullspercale, vävt för hög hållbarhet och tvättat enligt OEKO-TEX klass I (hudkontakt). Konstruerat för reparation och återtagning vid slutet av livslängden.",
            "no": "Todelt sengetøysett i 100 % GOTS-sertifisert økologisk bomullspercale, vevd for høy slitestyrke og vasket etter OEKO-TEX klasse I (hudkontakt). Designet for reparasjon og retur ved slutten av levetiden.",
            "fi": "Kaksiosainen vuodevaatesetti 100-prosenttisesta GOTS-sertifioidusta luomupuuvillapercaalista, kestäväksi kudottu ja OEKO-TEX-luokan I (ihokosketus) mukaisesti pesty. Suunniteltu korjattavaksi ja palautettavaksi käytön päätyttyä.",
            "it": "Set di biancheria da letto due pezzi in percalle di cotone biologico certificato GOTS al 100 %, tessuto per elevata durata e lavato secondo OEKO-TEX Classe I (contatto pelle). Progettato per la riparazione e la presa indietro a fine vita.",
        },
    },
    "09521002005004": {
        "file": "extensions/eu/battery/examples/battery-product.jsonld",
        "name": {
            "en": "EcoCell Industrial Battery Module IM-500",
            "de": "EcoCell Industrie-Batteriemodul IM-500",
            "fr": "Module de batterie industrielle EcoCell IM-500",
            "es": "Módulo de batería industrial EcoCell IM-500",
            "nl": "EcoCell industriële batterijmodule IM-500",
            "da": "EcoCell industribatterimodul IM-500",
            "pl": "Przemysłowy moduł akumulatora EcoCell IM-500",
            "sv": "EcoCell industribatterimodul IM-500",
            "no": "EcoCell industribatterimodul IM-500",
            "fi": "EcoCell teollisuusakkumoduuli IM-500",
            "it": "Modulo batteria industriale EcoCell IM-500",
        },
        "description": {
            "en": "High-capacity lithium iron phosphate battery module for industrial energy storage. Designed for long cycle life and safety.",
            "de": "Hochkapazitäts-LFP-Batteriemodul für industrielle Energiespeicherung. Entwickelt für lange Zyklenlebensdauer und Sicherheit.",
            "fr": "Module de batterie LFP haute capacité pour le stockage d'énergie industriel. Conçu pour une longue durée de vie cyclique et la sécurité.",
            "es": "Módulo de batería LFP de alta capacidad para almacenamiento energético industrial. Diseñado para una larga vida útil de ciclos y seguridad.",
            "nl": "Lithium-ijzerfosfaat-batterijmodule met hoge capaciteit voor industriële energieopslag. Ontworpen voor een lange cyclusduur en veiligheid.",
            "da": "LFP-batterimodul med høj kapacitet til industriel energilagring. Designet til lang cyklus-levetid og sikkerhed.",
            "pl": "Moduł akumulatora litowo-żelazowo-fosforanowego (LFP) o dużej pojemności do magazynowania energii w przemyśle. Zaprojektowany z myślą o długiej żywotności cyklicznej i bezpieczeństwie.",
            "sv": "LFP-batterimodul med hög kapacitet för industriell energilagring. Konstruerad för lång cykellivslängd och säkerhet.",
            "no": "LFP-batterimodul med høy kapasitet for industriell energilagring. Designet for lang syklus-levetid og sikkerhet.",
            "fi": "Suurkapasiteettinen LFP-akkumoduuli teolliseen energiavarastointiin. Suunniteltu pitkän käyttöiän ja turvallisuuden ehdoilla.",
            "it": "Modulo batteria LFP ad alta capacità per lo stoccaggio energetico industriale. Progettato per una lunga durata ciclica e sicurezza.",
        },
    },
    "09521003000442": {
        "file": "extensions/eu/battery/examples/portable-ebike-battery.jsonld",
        "name": {
            "en": "VeloPower e-bike battery pack VP-48V-14Ah",
            "de": "VeloPower E-Bike-Akku VP-48V-14Ah",
            "fr": "Batterie de vélo électrique VeloPower VP-48V-14Ah",
            "es": "Batería para e-bike VeloPower VP-48V-14Ah",
            "nl": "VeloPower e-bike accu VP-48V-14Ah",
            "da": "VeloPower elcykel-batteripakke VP-48V-14Ah",
            "pl": "Akumulator do roweru elektrycznego VeloPower VP-48V-14Ah",
            "sv": "VeloPower elcykelbatteri VP-48V-14Ah",
            "no": "VeloPower el-sykkelbatteri VP-48V-14Ah",
            "fi": "VeloPower sähköpyörän akku VP-48V-14Ah",
            "it": "Batteria per e-bike VeloPower VP-48V-14Ah",
        },
        "description": {
            "en": "48 V / 14 Ah LMT (Light Means of Transport) NMC622 battery pack, eligible for stationary second-life reuse.",
            "de": "48-V/14-Ah-Akku für leichte Elektrofahrzeuge (LMT) auf NMC622-Basis, geeignet für die stationäre Zweitnutzung.",
            "fr": "Batterie 48 V / 14 Ah pour véhicules de mobilité légère (LMT) en chimie NMC622, éligible à un usage stationnaire en seconde vie.",
            "es": "Batería 48 V / 14 Ah para vehículos ligeros (LMT) con química NMC622, apta para reutilización estacionaria en segunda vida.",
            "nl": "48 V / 14 Ah accu voor lichte elektrische voertuigen (LMT) op NMC622-basis, geschikt voor stationair hergebruik in second life.",
            "da": "48 V / 14 Ah batteripakke til lette transportmidler (LMT) baseret på NMC622, egnet til stationær second-life-genbrug.",
            "pl": "Akumulator 48 V / 14 Ah do lekkich pojazdów elektrycznych (LMT) w chemii NMC622, kwalifikujący się do stacjonarnego ponownego użycia w drugim cyklu życia.",
            "sv": "48 V / 14 Ah batteripaket för lätta elfordon (LMT) i NMC622-kemi, lämpligt för stationär återanvändning i andra liv.",
            "no": "48 V / 14 Ah batteripakke for lette elektriske kjøretøy (LMT) i NMC622-kjemi, egnet for stasjonær gjenbruk i annen levetid.",
            "fi": "48 V / 14 Ah:n akku kevyisiin sähköisiin liikkumisvälineisiin (LMT), NMC622-kemia, soveltuu kiinteään toisen elinkaaren uudelleenkäyttöön.",
            "it": "Pacco batteria 48 V / 14 Ah per mezzi di mobilità leggera (LMT) in chimica NMC622, idoneo al riutilizzo stazionario in seconda vita.",
        },
    },
    "09521004005019": {
        "file": "extensions/eu/ppwr/examples/beverage-bottle.jsonld",
        "name": {
            "en": "Mountain Spring Mineral Water — 500 mL PET bottle",
            "de": "Mountain Spring Mineralwasser — 500-ml-PET-Flasche",
            "fr": "Eau minérale Mountain Spring — bouteille PET de 500 ml",
            "es": "Agua mineral Mountain Spring — botella PET de 500 ml",
            "nl": "Mountain Spring mineraalwater — PET-fles van 500 ml",
            "da": "Mountain Spring mineralvand — 500 ml PET-flaske",
            "pl": "Woda mineralna Mountain Spring — butelka PET 500 ml",
            "sv": "Mountain Spring mineralvatten — 500 ml PET-flaska",
            "no": "Mountain Spring mineralvann — 500 ml PET-flaske",
            "fi": "Mountain Spring -kivennäisvesi — 500 ml:n PET-pullo",
            "it": "Acqua minerale Mountain Spring — bottiglia PET da 500 ml",
        },
        "description": {
            "en": "50% post-consumer rPET bottle with Grade A recyclability, deposit-return scheme membership, and harmonised separate-collection PET symbol.",
            "de": "Flasche aus 50 % Post-Consumer-rPET, Recyclingfähigkeit Klasse A, Pfand-Rücknahme-System und harmonisiertes PET-Sammelsymbol.",
            "fr": "Bouteille en rPET post-consommation à 50 %, recyclabilité Grade A, adhésion au système de consigne et symbole harmonisé de collecte sélective PET.",
            "es": "Botella con 50 % de rPET post-consumo, reciclabilidad Grado A, sistema de devolución de envases (depósito) y símbolo armonizado de recogida selectiva PET.",
            "nl": "Fles van 50% post-consumer rPET, recycleerbaarheid klasse A, deelname aan statiegeldsysteem en geharmoniseerd PET-inzamelsymbool.",
            "da": "Flaske af 50 % post-consumer rPET, genanvendelighed grad A, tilmeldt pant-retur-system og harmoniseret separat indsamlings-PET-symbol.",
            "pl": "Butelka z 50 % rPET pokonsumenckiego, recykling klasy A, członkostwo w systemie kaucji-zwrotu i zharmonizowany symbol selektywnej zbiórki PET.",
            "sv": "Flaska av 50 % post-consumer-rPET, återvinningsbarhet klass A, ansluten till pantsystem och harmoniserad PET-insamlingssymbol.",
            "no": "Flaske av 50 % post-consumer rPET, gjenvinnbarhet klasse A, tilknyttet pantesystem og harmonisert PET-innsamlingssymbol.",
            "fi": "Pullo, jossa on 50 % kierrätettyä rPET-muovia, kierrätettävyysluokka A, panttijärjestelmän jäsenyys ja harmonisoitu PET-erilliskeräysmerkki.",
            "it": "Bottiglia con 50 % di rPET post-consumo, riciclabilità Grado A, adesione al sistema di reso del vuoto e simbolo armonizzato di raccolta differenziata PET.",
        },
    },
    "09521005000808": {
        "file": "extensions/eu/ppwr/examples/multi-layer-pouch.jsonld",
        "name": {
            "en": "Crispy Snack Pouch — 80 g multi-layer foil",
            "de": "Crispy Snack-Beutel — 80 g Mehrschichtfolie",
            "fr": "Sachet de snack Crispy — film multicouche de 80 g",
            "es": "Bolsa de snack Crispy — film multicapa de 80 g",
            "nl": "Crispy snackzakje — meerlaagsfolie van 80 g",
            "da": "Crispy snackpose — 80 g flerlagsfolie",
            "pl": "Torebka przekąski Crispy — folia wielowarstwowa 80 g",
            "sv": "Crispy snackpåse — 80 g flerlagsfolie",
            "no": "Crispy snackpose — 80 g flerlagsfolie",
            "fi": "Crispy-naposteltavapussi — 80 g monikerroskalvo",
            "it": "Bustina snack Crispy — pellicola multistrato da 80 g",
        },
        "description": {
            "en": "PET/Aluminium/PE laminate pouch, Grade C recyclability (scheduled phase-out by 2038), PFAS-free declaration.",
            "de": "Beutel aus PET/Aluminium/PE-Laminat, Recyclingfähigkeit Klasse C (geplanter Ausstieg bis 2038), PFAS-frei-Erklärung.",
            "fr": "Sachet en stratifié PET/aluminium/PE, recyclabilité Grade C (élimination programmée d'ici 2038), déclaration sans PFAS.",
            "es": "Bolsa de laminado PET/aluminio/PE, reciclabilidad Grado C (eliminación gradual prevista para 2038), declaración libre de PFAS.",
            "nl": "Zakje van PET/aluminium/PE-laminaat, recycleerbaarheid klasse C (uitfasering gepland tegen 2038), PFAS-vrij verklaard.",
            "da": "Pose af PET/aluminium/PE-laminat, genanvendelighed grad C (planlagt udfasning inden 2038), PFAS-fri-erklæring.",
            "pl": "Torebka z laminatu PET/aluminium/PE, recykling klasy C (planowane wycofanie do 2038 r.), deklaracja PFAS-free.",
            "sv": "Påse i PET/aluminium/PE-laminat, återvinningsbarhet klass C (planerad utfasning till 2038), PFAS-fri-deklaration.",
            "no": "Pose i PET/aluminium/PE-laminat, gjenvinnbarhet klasse C (planlagt utfasing innen 2038), PFAS-fri erklæring.",
            "fi": "PET/alumiini/PE-laminaattipussi, kierrätettävyysluokka C (suunniteltu poistuminen vuoteen 2038 mennessä), PFAS-vapaaksi todistettu.",
            "it": "Bustina in laminato PET/Alluminio/PE, riciclabilità Grado C (eliminazione progressiva prevista entro il 2038), dichiarazione senza PFAS.",
        },
    },
    "09521006003013": {
        "file": "extensions/eu/ppwr/examples/ecommerce-carton.jsonld",
        "name": {
            "en": "EcoFlow corrugated shipping carton — 30×20×15 cm",
            "de": "EcoFlow Wellpapp-Versandkarton — 30×20×15 cm",
            "fr": "Carton d'expédition ondulé EcoFlow — 30×20×15 cm",
            "es": "Caja de envío en cartón corrugado EcoFlow — 30×20×15 cm",
            "nl": "EcoFlow golfkartonnen verzenddoos — 30×20×15 cm",
            "da": "EcoFlow bølgepap-forsendelseskasse — 30×20×15 cm",
            "pl": "Pudełko wysyłkowe z tektury falistej EcoFlow — 30×20×15 cm",
            "sv": "EcoFlow wellpappslåda — 30×20×15 cm",
            "no": "EcoFlow wellpappkartong — 30×20×15 cm",
            "fi": "EcoFlow aaltopahvilähetyslaatikko — 30×20×15 cm",
            "it": "Scatola di spedizione EcoFlow in cartone ondulato — 30×20×15 cm",
        },
        "description": {
            "en": "Grouped/Transport tier carton, 95% recycled cardboard (80% post-consumer + 15% pre-consumer), Grade A recyclability.",
            "de": "Karton der Verpackungsebene Gruppen-/Transportverpackung, 95 % recycelte Pappe (80 % post-consumer + 15 % pre-consumer), Recyclingfähigkeit Klasse A.",
            "fr": "Carton de niveau emballage groupé/transport, 95 % de carton recyclé (80 % post-consommation + 15 % pré-consommation), recyclabilité Grade A.",
            "es": "Caja de nivel embalaje agrupado/transporte, 95 % de cartón reciclado (80 % post-consumo + 15 % pre-consumo), reciclabilidad Grado A.",
            "nl": "Doos van verpakkingsniveau gegroepeerd/transport, 95 % gerecycled karton (80 % post-consumer + 15 % pre-consumer), recycleerbaarheid klasse A.",
            "da": "Karton i emballageniveauet samle-/transportemballage, 95 % genanvendt pap (80 % post-consumer + 15 % pre-consumer), genanvendelighed grad A.",
            "pl": "Pudełko poziomu opakowania zbiorczego/transportowego, 95 % tektury z recyklingu (80 % pokonsumenckiej + 15 % przedkonsumenckiej), recykling klasy A.",
            "sv": "Kartong i förpackningsnivå gruppförpackning/transport, 95 % återvunnen kartong (80 % post-consumer + 15 % pre-consumer), återvinningsbarhet klass A.",
            "no": "Kartong i emballasjenivå gruppe-/transport, 95 % resirkulert papp (80 % post-consumer + 15 % pre-consumer), gjenvinnbarhet klasse A.",
            "fi": "Pakkaustason ryhmä-/kuljetuspakkauskartonki, 95 % kierrätyspahvia (80 % kulutuksen jälkeen + 15 % ennen kulutusta), kierrätettävyysluokka A.",
            "it": "Cartone di livello imballaggio raggruppato/da trasporto, 95 % di cartone riciclato (80 % post-consumo + 15 % pre-consumo), riciclabilità Grado A.",
        },
    },
}


def to_langtagged_array(texts: dict[str, str]) -> list[dict[str, str]]:
    """Convert {lang: text} to a JSON-LD array of @language/@value nodes."""
    return [{"@value": texts[lang], "@language": lang} for lang in LANGS if lang in texts]


def apply_to_seed(seed_path: pathlib.Path, name: dict[str, str], description: dict[str, str]) -> None:
    data = json.loads(seed_path.read_text(encoding="utf-8"))
    data["productName"] = to_langtagged_array(name)
    desc_key = (
        "gs1:productDescription"
        if "gs1:productDescription" in data
        else "productDescription"
    )
    data[desc_key] = to_langtagged_array(description)
    seed_path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> int:
    here = pathlib.Path(__file__).resolve().parent.parent  # openepcis-dpp-ready/
    missing = []
    for gtin, payload in PRODUCTS.items():
        rel = payload["file"]
        seed = here / rel
        if not seed.exists():
            missing.append((gtin, rel))
            continue
        apply_to_seed(seed, payload["name"], payload["description"])
        print(f"  {gtin}  ✓  {rel}")
    if missing:
        print("Missing seed files:", file=sys.stderr)
        for gtin, rel in missing:
            print(f"  {gtin}  ✗  {rel}", file=sys.stderr)
        return 1
    print(f"\n{len(PRODUCTS)} seed files updated with {len(LANGS)} languages each.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
