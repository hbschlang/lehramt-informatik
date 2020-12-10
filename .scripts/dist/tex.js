"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sammleStichwörterEinerDatei = exports.sammleStichwörter = exports.gibInhaltEinesTexMakros = void 0;
var helfer_1 = require("./helfer");
function assembleMacroRegExp(macroName) {
    return new RegExp('\\' + macroName + '\{([^\}]*)\}', 'g');
}
function säubereStichwort(stichwort) {
    return stichwort.replace(/\s+/g, ' ');
}
function gibInhaltEinesTexMakros(macroName, markup) {
    var regExp = assembleMacroRegExp(macroName);
    var match = regExp.exec(markup);
    if (match)
        return match[1];
}
exports.gibInhaltEinesTexMakros = gibInhaltEinesTexMakros;
/**
 * Sammle alle Stichwörter eines TeX-Inhaltes (string). Doppelte Stichwörter
 * werden nur als eins aufgelistet.
 *
 * @param {string} inhalt - Der Textinhalt einer TeX-Datei.
 */
function sammleStichwörter(inhalt) {
    var re = assembleMacroRegExp('index');
    var match;
    var stichwörter = new Set();
    do {
        match = re.exec(inhalt);
        if (match) {
            var stichwort = säubereStichwort(match[1]);
            stichwörter.add(stichwort);
        }
    } while (match);
    return Array.from(stichwörter);
}
exports.sammleStichwörter = sammleStichwörter;
/**
 * Collect the tags of a TeX file.
 * @param {string} pfad
 */
function sammleStichwörterEinerDatei(pfad) {
    return sammleStichwörter(helfer_1.leseRepoDatei(pfad));
}
exports.sammleStichwörterEinerDatei = sammleStichwörterEinerDatei;