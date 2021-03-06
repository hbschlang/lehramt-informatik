"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generiereExamenSammlungPdf = exports.generiereExamensÜbersicht = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var examen_1 = require("../examen");
var helfer_1 = require("../helfer");
var sammlung_1 = require("../sammlung");
var glob_1 = __importDefault(require("glob"));
/**
 * ```js
 * [
 *   'Thema-1/Teilaufgabe-1/Aufgabe-3.tex',
 *   'Thema-1/Teilaufgabe-1/Aufgabe-4.tex',
 *   'Thema-1/Teilaufgabe-2/Aufgabe-2.tex',
 *   'Thema-1/Teilaufgabe-2/Aufgabe-4.tex',
 *   'Thema-2/Teilaufgabe-2/Aufgabe-2.tex',
 *   'Thema-2/Teilaufgabe-2/Aufgabe-5.tex'
 * ]
 * ```
 *
 * ```js
 * {
 *   'Thema 1': {
 *     'Teilaufgabe 1': {
 *       'Aufgabe 3': 'Thema-1/Teilaufgabe-1/Aufgabe-3.tex',
 *       'Aufgabe 4': 'Thema-1/Teilaufgabe-1/Aufgabe-4.tex'
 *     },
 *     'Teilaufgabe 2': {
 *       'Aufgabe 2': 'Thema-1/Teilaufgabe-2/Aufgabe-2.tex',
 *       'Aufgabe 4': 'Thema-1/Teilaufgabe-2/Aufgabe-4.tex'
 *     }
 *   },
 *   'Thema 2': {
 *     'Teilaufgabe 2': {
 *       'Aufgabe 2': 'Thema-2/Teilaufgabe-2/Aufgabe-2.tex',
 *       'Aufgabe 5': 'Thema-2/Teilaufgabe-2/Aufgabe-5.tex'
 *     }
 *   }
 * }
 * ```
 *
 * @param {string} relativerPfad
 */
function leseAufgaben(relativerPfad) {
    var e_1, _a, e_2, _b;
    /**
     * Thema-1: Thema 1
     * Teilaufgabe-2: Teilaufgabe 2
     * Aufgabe-3.tex: Aufgabe 3
     */
    function macheSegmenteLesbar(segment) {
        return segment.replace('-', ' ').replace('.tex', '');
    }
    var dateien = glob_1.default.sync('**/*.tex', { cwd: relativerPfad });
    var baum = {};
    try {
        for (var dateien_1 = __values(dateien), dateien_1_1 = dateien_1.next(); !dateien_1_1.done; dateien_1_1 = dateien_1.next()) {
            var pfad = dateien_1_1.value;
            if (pfad.match(/(Thema-(?<thema>\d)\/)?(Teilaufgabe-(?<teilaufgabe>\d)\/)?Aufgabe-(?<aufgabe>\d+)\.tex$/)) {
                var segmente = pfad.split(path_1.default.sep);
                var unterBaum = baum;
                try {
                    for (var segmente_1 = (e_2 = void 0, __values(segmente)), segmente_1_1 = segmente_1.next(); !segmente_1_1.done; segmente_1_1 = segmente_1.next()) {
                        var segment = segmente_1_1.value;
                        var segmentLesbar = macheSegmenteLesbar(segment);
                        if (!unterBaum[segmentLesbar] && segment.indexOf('.tex') === -1) {
                            unterBaum[segmentLesbar] = {};
                        }
                        else if (segment.indexOf('.tex') > -1) {
                            unterBaum[segmentLesbar] = pfad;
                        }
                        if (segment.indexOf('.tex') === -1) {
                            unterBaum = unterBaum[segmentLesbar];
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (segmente_1_1 && !segmente_1_1.done && (_b = segmente_1.return)) _b.call(segmente_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (dateien_1_1 && !dateien_1_1.done && (_a = dateien_1.return)) _a.call(dateien_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return baum;
}
function erzeugeEinrückung(ebene) {
    return '\n' + ' '.repeat(4 * ebene) + '- ';
}
/**
 * ```md
 * - 2015 Frühjahr: [Scan.pdf](...46116/2015/03/Scan.pdf) [OCR.txt](…46116/2015/03/OCR.txt)
 *     - Thema 1
 *         - Teilaufgabe 1
 *             - [Aufgabe 3](…46116/2015/03/Thema-1/Teilaufgabe-1/Aufgabe-3.pdf)
 *         - Teilaufgabe 2
 *             - [Aufgabe 1](…46116/2015/03/Thema-1/Teilaufgabe-2/Aufgabe-1.pdf)
 *             - [Aufgabe 3](…46116/2015/03/Thema-1/Teilaufgabe-2/Aufgabe-3.pdf)
 *```
 *
 * @param {object} aufgabenBaum
 * @param {string} pfad
 * @param {integer} ebene
 */
function generiereAufgabenRekursiv(aufgabenBaum, pfad, ebene) {
    if (ebene === void 0) { ebene = 1; }
    var ausgabe = [];
    // title: Thema 1, Teilaufgabe 2, Aufgabe 3
    for (var titel in aufgabenBaum) {
        if (typeof aufgabenBaum[titel] === 'string') {
            var aufgabenPfad = path_1.default.join(pfad, aufgabenBaum[titel]);
            var aufgabe = sammlung_1.aufgabenSammlung.gib(aufgabenPfad);
            ausgabe.push(erzeugeEinrückung(ebene) + aufgabe.gibTitelNurAufgabe(true));
        }
        else {
            ausgabe.push("" + erzeugeEinrückung(ebene) + titel + " " + generiereAufgabenRekursiv(aufgabenBaum[titel], pfad, ebene + 1));
        }
    }
    return ausgabe.join(' ');
}
function generiereAufgabenBaum(pfad) {
    return generiereAufgabenRekursiv(leseAufgaben(pfad), pfad);
}
var AusgabeSammler = /** @class */ (function () {
    function AusgabeSammler(redselig) {
        if (redselig === void 0) { redselig = false; }
        this.speicher = [];
        this.redselig = redselig;
    }
    AusgabeSammler.prototype.add = function (ausgabe) {
        if (this.redselig)
            console.log(ausgabe);
        this.speicher.push(ausgabe);
    };
    AusgabeSammler.prototype.gibText = function () {
        return this.speicher.join('\n');
    };
    return AusgabeSammler;
}());
function erzeugeDateiLink(pfad, dateiName, downloadDateiName, einstellungen) {
    return helfer_1.generiereLink(dateiName, path_1.default.join(pfad, dateiName), downloadDateiName, einstellungen);
}
function generiereExamensÜbersicht() {
    var e_3, _a, e_4, _b;
    var ausgabe = new AusgabeSammler();
    for (var nummer in examen_1.examensTitel) {
        ausgabe.add("\n### " + nummer + ": " + examen_1.examensTitel[nummer] + "\n");
        var nummernPfad = path_1.default.join(helfer_1.repositoryPfad, 'Staatsexamen', nummer);
        var jahrVerzeichnisse = fs_1.default.readdirSync(nummernPfad);
        try {
            for (var jahrVerzeichnisse_1 = (e_3 = void 0, __values(jahrVerzeichnisse)), jahrVerzeichnisse_1_1 = jahrVerzeichnisse_1.next(); !jahrVerzeichnisse_1_1.done; jahrVerzeichnisse_1_1 = jahrVerzeichnisse_1.next()) {
                var jahr = jahrVerzeichnisse_1_1.value;
                var jahrPfad = path_1.default.join(nummernPfad, jahr);
                if (fs_1.default.statSync(jahrPfad).isDirectory()) {
                    var monatsVerzeichnisse = fs_1.default.readdirSync(jahrPfad);
                    try {
                        for (var monatsVerzeichnisse_1 = (e_4 = void 0, __values(monatsVerzeichnisse)), monatsVerzeichnisse_1_1 = monatsVerzeichnisse_1.next(); !monatsVerzeichnisse_1_1.done; monatsVerzeichnisse_1_1 = monatsVerzeichnisse_1.next()) {
                            var monat = monatsVerzeichnisse_1_1.value;
                            var examen = sammlung_1.examenSammlung.gib(nummer, jahr, monat);
                            var monatsPfad = path_1.default.join(jahrPfad, monat);
                            var scanLink = erzeugeDateiLink(monatsPfad, 'Scan.pdf', examen.dateiName + "_Scan.pdf");
                            var ocrLink = erzeugeDateiLink(monatsPfad, 'OCR.txt', examen.dateiName + "_OCR.txt", { linkePdf: false });
                            ausgabe.add("- " + examen.jahrJahreszeit + ": " + scanLink + " " + ocrLink + " " + generiereAufgabenBaum(monatsPfad));
                        }
                    }
                    catch (e_4_1) { e_4 = { error: e_4_1 }; }
                    finally {
                        try {
                            if (monatsVerzeichnisse_1_1 && !monatsVerzeichnisse_1_1.done && (_b = monatsVerzeichnisse_1.return)) _b.call(monatsVerzeichnisse_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                    }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (jahrVerzeichnisse_1_1 && !jahrVerzeichnisse_1_1.done && (_a = jahrVerzeichnisse_1.return)) _a.call(jahrVerzeichnisse_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    return ausgabe.gibText();
}
exports.generiereExamensÜbersicht = generiereExamensÜbersicht;
function generiereExamenSammlungPdf() {
    var e_5, _a, e_6, _b;
    for (var nummer in examen_1.examensTitel) {
        var ausgabe = new AusgabeSammler();
        var nummernPfad = path_1.default.join(helfer_1.repositoryPfad, 'Staatsexamen', nummer);
        var jahrVerzeichnisse = fs_1.default.readdirSync(nummernPfad);
        try {
            for (var jahrVerzeichnisse_2 = (e_5 = void 0, __values(jahrVerzeichnisse)), jahrVerzeichnisse_2_1 = jahrVerzeichnisse_2.next(); !jahrVerzeichnisse_2_1.done; jahrVerzeichnisse_2_1 = jahrVerzeichnisse_2.next()) {
                var jahr = jahrVerzeichnisse_2_1.value;
                var jahrPfad = path_1.default.join(nummernPfad, jahr);
                if (fs_1.default.statSync(jahrPfad).isDirectory()) {
                    var monatsVerzeichnisse = fs_1.default.readdirSync(jahrPfad);
                    try {
                        for (var monatsVerzeichnisse_2 = (e_6 = void 0, __values(monatsVerzeichnisse)), monatsVerzeichnisse_2_1 = monatsVerzeichnisse_2.next(); !monatsVerzeichnisse_2_1.done; monatsVerzeichnisse_2_1 = monatsVerzeichnisse_2.next()) {
                            var monat = monatsVerzeichnisse_2_1.value;
                            var examen = sammlung_1.examenSammlung.gib(nummer, jahr, monat);
                            ausgabe.add("\n\\liTrennSeite{" + examen.jahreszeit + " " + examen.jahr + "}");
                            var scanPfad = helfer_1.macheRelativenPfad(path_1.default.join(jahrPfad, monat, 'Scan.pdf'));
                            //scanPfad = scanPfad.replace(`Staatsexamen/${nummer}/`, '')
                            var includePdf = "\\liBindePdfEin{" + scanPfad + "}";
                            ausgabe.add(includePdf);
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (monatsVerzeichnisse_2_1 && !monatsVerzeichnisse_2_1.done && (_b = monatsVerzeichnisse_2.return)) _b.call(monatsVerzeichnisse_2);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (jahrVerzeichnisse_2_1 && !jahrVerzeichnisse_2_1.done && (_a = jahrVerzeichnisse_2.return)) _a.call(jahrVerzeichnisse_2);
            }
            finally { if (e_5) throw e_5.error; }
        }
        var ergebnis = ausgabe.gibText();
        var texMarkup = "\\documentclass{lehramt-informatik-examen-sammlung}\n\\liPruefungsNummer{" + nummer + "}\n\\liPruefungsTitel{" + examen_1.examensTitel[nummer] + "}\n\n\\begin{document}\n" + ergebnis + "\n\\end{document}";
        helfer_1.schreibeDatei(helfer_1.macheRepoPfad('Staatsexamen', nummer, 'Examensammlung.tex'), texMarkup);
    }
}
exports.generiereExamenSammlungPdf = generiereExamenSammlungPdf;
