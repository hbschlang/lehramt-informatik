import { leseRepoDatei } from './helfer'

function assembleMacroRegExp (macroName: String): RegExp {
  return new RegExp('\\' + macroName + '\{([^\}]*)\}', 'g')
}

function säubereStichwort (stichwort: string): string {
  return stichwort.replace(/\s+/g, ' ')
}

export function gibInhaltEinesTexMakros (makroName: string, markup: string): string | undefined {
  const regExp = assembleMacroRegExp(makroName)
  const übereinstimmung = regExp.exec(markup)
  if (übereinstimmung) return übereinstimmung[1]
}

/**
 * Sammle alle Stichwörter eines TeX-Inhaltes (string). Doppelte Stichwörter
 * werden nur als eins aufgelistet.
 *
 * @param {string} inhalt - Der Textinhalt einer TeX-Datei.
 */
export function sammleStichwörter (inhalt: string) {
  const re = assembleMacroRegExp('index')
  let übereinstimmung
  const stichwörter = new Set<string>()
  do {
    übereinstimmung = re.exec(inhalt)
    if (übereinstimmung) {
      const stichwort = säubereStichwort(übereinstimmung[1])
      stichwörter.add(stichwort)
    }
  } while (übereinstimmung)
  return Array.from(stichwörter)
}

/**
 * Collect the tags of a TeX file.
 * @param {string} pfad
 */
export function sammleStichwörterEinerDatei (pfad: string) {
  return sammleStichwörter(leseRepoDatei(pfad))
}
