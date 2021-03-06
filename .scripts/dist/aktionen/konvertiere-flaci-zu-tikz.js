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
exports.konvertiereFlaciZuTikz = void 0;
var path_1 = __importDefault(require("path"));
function formatierteLänge(länge, spiegeln) {
    if (spiegeln === void 0) { spiegeln = false; }
    if (spiegeln) {
        länge = länge * -1;
    }
    länge = Math.round((länge / 70) * 100) / 100;
    return länge + "cm";
}
function formatiereZustandsName(zustand) {
    var name = zustand.Name;
    var regExp = /^(z|q)(\d+)$/;
    if (name.match(regExp)) {
        name = name.replace(regExp, '$1_$2');
        name = "$" + name + "$";
    }
    return name;
}
function formatiereZustand(state) {
    var additionsOptions = '';
    if (state.Start)
        additionsOptions = ',initial';
    if (state.Final)
        additionsOptions = additionsOptions + ',accepting';
    var name = formatiereZustandsName(state);
    var koordinate = "at (" + formatierteLänge(state.x) + "," + formatierteLänge(state.y, true) + ")";
    return "  \\node[state" + additionsOptions + "] (" + state.Name + ") " + koordinate + " {" + name + "};";
}
function formatiereÜbergang(trans, states) {
    var source = states[trans.Source];
    var target = states[trans.Target];
    var eingabeSymbole = '$' + trans.Labels.map(function (value) {
        if (value === '')
            return '\\varepsilon';
        return value;
    }).join(',') + '$';
    var optionen = bestimmeÜbergangsOptionen(trans);
    return "  \\path (" + source + ") edge" + formatiereOptionen(optionen) + " node{" + eingabeSymbole + "} (" + target + ");";
}
function bestimmeÜbergangsOptionen(trans, standardOption) {
    if (standardOption === void 0) { standardOption = 'auto'; }
    var optionen = [standardOption];
    if (trans.Source === trans.Target) {
        // loop above ergibt eine kleiner Schleife, ähnlich wie loop left etc.
        // So sind alle Schleifen einheitlich groß.
        optionen.push('loop above');
    }
    if ((trans.x !== 0 || trans.y !== 0) && !optionen.includes('loop above')) {
        optionen.push('bend left');
    }
    return optionen;
}
function formatiereOptionen(optionen) {
    if (optionen.length > 0) {
        return '[' + optionen.join(',') + ']';
    }
    return '';
}
function formatiereKellerZeichen(zeichen) {
    if (zeichen === '')
        return 'EPSILON';
    if (zeichen === '#')
        return 'KELLERBODEN';
    return zeichen;
}
function formatiereKellerÜbergang(trans, states) {
    var e_1, _a;
    var source = states[trans.Source];
    var target = states[trans.Target];
    var übergänge = [];
    try {
        for (var _b = __values(trans.Labels), _c = _b.next(); !_c.done; _c = _b.next()) {
            var label = _c.value;
            var übergang = [];
            übergang.push(formatiereKellerZeichen(label[1]));
            übergang.push(formatiereKellerZeichen(label[0]));
            var kellerAktion = label[2].map(function (value) {
                return formatiereKellerZeichen(value);
            }).join(' ');
            if (kellerAktion === '')
                kellerAktion = 'EPSILON';
            übergang.push(kellerAktion);
            übergänge.push('    ' + übergang.join(', '));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var optionen = bestimmeÜbergangsOptionen(trans, 'above');
    var übergängeFormatiert = übergänge.join(';\n') + ';';
    return "  \\liKellerKante" + formatiereOptionen(optionen) + "{" + source + "}{" + target + "}{\n" + übergängeFormatiert + "\n  }\n";
}
function formatiereTuringZeichen(zeichen) {
    if (zeichen === '☐')
        return 'LEER';
    return zeichen;
}
function formatiereTuringÜbergang(trans, states) {
    var e_2, _a;
    var source = states[trans.Source];
    var target = states[trans.Target];
    var übergänge = [];
    try {
        for (var _b = __values(trans.Labels), _c = _b.next(); !_c.done; _c = _b.next()) {
            var label = _c.value;
            var übergang = [];
            übergang.push(formatiereTuringZeichen(label[0]));
            übergang.push(formatiereTuringZeichen(label[1]));
            übergang.push(formatiereTuringZeichen(label[2]));
            übergänge.push('    ' + übergang.join(', '));
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    var optionen = bestimmeÜbergangsOptionen(trans, 'above');
    var übergängeFormatiert = übergänge.join(';\n') + ';';
    return "  \\liTuringKante" + formatiereOptionen(optionen) + "{" + source + "}{" + target + "}{\n" + übergängeFormatiert + "\n  }\n";
}
function formatiereFlaciLink(def) {
    return "\\liFlaci{A" + def.GUID + "}";
}
function formatiereTexEnv(name, inhalt, optionen) {
    if (optionen === void 0) { optionen = null; }
    var opt = '';
    if (optionen != null) {
        opt = '[' + optionen + ']';
    }
    return '\\begin{' + name + '}' + opt + '\n' + inhalt + '\n\\end{' + name + '}';
}
function formatiereAutomat(def) {
    var e_3, _a, e_4, _b, e_5, _c;
    var statesRendered = [];
    var automatenTyp;
    if (def.type === 'NKA' || def.type === 'DKA') {
        automatenTyp = 'keller';
    }
    else if (def.type === 'TM') {
        automatenTyp = 'turing';
    }
    else {
        automatenTyp = 'endlicher';
    }
    var states = def.automaton.States;
    var stateNames = {};
    try {
        for (var states_1 = __values(states), states_1_1 = states_1.next(); !states_1_1.done; states_1_1 = states_1.next()) {
            var state = states_1_1.value;
            stateNames[state.ID] = state.Name;
            statesRendered.push(formatiereZustand(state));
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (states_1_1 && !states_1_1.done && (_a = states_1.return)) _a.call(states_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    var transitionsRendered = [];
    try {
        for (var states_2 = __values(states), states_2_1 = states_2.next(); !states_2_1.done; states_2_1 = states_2.next()) {
            var state = states_2_1.value;
            try {
                for (var _d = (e_5 = void 0, __values(state.Transitions)), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var transition = _e.value;
                    if (automatenTyp === 'endlicher') {
                        transitionsRendered.push(formatiereÜbergang(transition, stateNames));
                    }
                    else if (automatenTyp === 'keller') {
                        var trans = transition;
                        transitionsRendered.push(formatiereKellerÜbergang(trans, stateNames));
                    }
                    else {
                        var trans = transition;
                        transitionsRendered.push(formatiereTuringÜbergang(trans, stateNames));
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_c = _d.return)) _c.call(_d);
                }
                finally { if (e_5) throw e_5.error; }
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (states_2_1 && !states_2_1.done && (_b = states_2.return)) _b.call(states_2);
        }
        finally { if (e_4) throw e_4.error; }
    }
    var envOption;
    if (automatenTyp === 'endlicher') {
        envOption = 'li automat';
    }
    else if (automatenTyp === 'keller') {
        envOption = 'li kellerautomat';
    }
    else {
        envOption = 'li turingmaschine';
    }
    var inhalt = statesRendered.join('\n') + '\n\n' + transitionsRendered.join('\n').replace(/\n$/, '');
    var tikzPicture = formatiereTexEnv('center', formatiereTexEnv('tikzpicture', inhalt, envOption));
    var liAntwort = tikzPicture + '\n' + formatiereFlaciLink(def);
    return formatiereTexEnv('liAntwort', liAntwort);
}
function konvertiereFlaciZuTikz(jsonDateiPfad) {
    if (!jsonDateiPfad.match(/^\//)) {
        jsonDateiPfad = path_1.default.join(process.cwd(), jsonDateiPfad);
    }
    var definition = require(jsonDateiPfad);
    console.log(formatiereAutomat(definition));
}
exports.konvertiereFlaciZuTikz = konvertiereFlaciZuTikz;
