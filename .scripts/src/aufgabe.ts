import path from 'path'
import fs from 'fs'
import glob from 'glob'

import { leseRepoDatei, repositoryPfad, generiereMarkdownLink, macheRelativenPfad } from './helfer'
import { sammleStichwörter, gibInhaltEinesTexMakros } from './tex'
import { Examen, ExamenSammlung } from './examen'

export class Aufgabe {
  pfad: string
  inhalt?: string

  stichwörter: string[] = []
  titel?: string

  static pfadRegExp: RegExp = /.*Aufgabe_.*\.tex/

  constructor (pfad: string) {
    this.pfad = Aufgabe.normalisierePfad(pfad)
    if (fs.existsSync(this.pfad)) {
      this.inhalt = leseRepoDatei(this.pfad)
      if (this.inhalt) {
        this.stichwörter = sammleStichwörter(this.inhalt)
        this.titel = gibInhaltEinesTexMakros('liAufgabenTitel', this.inhalt)
      }
    }
  }

  static normalisierePfad (pfad: string): string {
    if (pfad.indexOf(repositoryPfad) > -1) {
      return pfad
    }
    return path.join(repositoryPfad, pfad)
  }

  static istAufgabe (pfad: string): boolean {
    if (pfad.match(Aufgabe.pfadRegExp)) {
      return true
    }
    return false
  }

  get titelFormatiert (): string {
    let präfix: string
    let stichwörter: string = ''
    if (this.titel) {
      präfix = this.titel
    } else {
      präfix = 'Aufgabe'
    }

    if (this.stichwörter) {
      stichwörter = this.stichwörterFormatiert
    }
    return `${präfix}${stichwörter}`
  }

  get stichwörterFormatiert (): string {
    if (this.stichwörter && this.stichwörter.length > 0) {
      return ` (${this.stichwörter.join(', ')})`
    }
    return ''
  }

  get markdownLink (): string {
    return generiereMarkdownLink(this.titelFormatiert, this.pfad)
  }

  static vergleichePfade(a: Aufgabe, b: Aufgabe): number {
    if (a.pfad < b. pfad) {
      return -1
    }
    if (a.pfad > b.pfad) {
      return 1
    }
    return 0
  }
}

export class ExamensAufgabe extends Aufgabe {
  nummer: number
  jahr: number
  monat: number
  thema?: number
  teilaufgabe?: number
  aufgabe: number

  examen: Examen

  static pfadRegExp: RegExp = /(?<nummer>\d{5})\/(?<jahr>\d{4})\/(?<monat>\d{2})\/(Thema-(?<thema>\d)\/)?(Teilaufgabe-(?<teilaufgabe>\d)\/)?Aufgabe-(?<aufgabe>\d+)\.tex$/

  static schwacherPfadRegExp: RegExp =  /(Thema-(?<thema>\d)\/)?(Teilaufgabe-(?<teilaufgabe>\d)\/)?Aufgabe-(?<aufgabe>\d+)\.tex$/

  constructor (pfad: string, examen: Examen) {
    super(pfad)
    this.examen = examen
    const match = pfad.match(ExamensAufgabe.pfadRegExp)
    if (!match || !match.groups) {
      throw new Error(`Konnten den Pfad der Examensaufgabe nicht lesen: ${pfad}`)
    }
    const gruppen = match.groups
    this.nummer = parseInt(gruppen.nummer)
    this.jahr = parseInt(gruppen.jahr)
    this.monat = parseInt(gruppen.monat)
    this.aufgabe = parseInt(gruppen.aufgabe)
    if (gruppen.thema) this.thema = parseInt(gruppen.thema)
    if (gruppen.teilaufgabe) this.teilaufgabe = parseInt(gruppen.teilaufgabe)
  }

  static istExamensAufgabe (pfad: string): boolean {
    if (pfad.match(ExamensAufgabe.pfadRegExp)) {
      return true
    }
    return false
  }

  get examensReferenz (): string {
    return `${this.nummer}:${this.jahr}:${this.monat.toString().padStart(2, '0')}`
  }

  get aufgabenReferenz (): string {
    const output = []
    if (this.thema) output.push(`T${this.thema}`)
    if (this.teilaufgabe) output.push(`TA${this.teilaufgabe}`)
    output.push(`A${this.aufgabe}`)
    return output.join(' ')
  }

  get titelKurz (): string {
    return `${this.examensReferenz} ${this.aufgabenReferenz}${this.stichwörterFormatiert}`
  }

  gibTitelNurAufgabe (alsMarkdownLink: boolean = false): string {
    const ausgabe = `Aufgabe ${this.aufgabe}${this.stichwörterFormatiert}`
    if (alsMarkdownLink) {
      return generiereMarkdownLink(ausgabe, this.pfad)
    }
    return ausgabe
  }

  get markdownLink (): string {
    return generiereMarkdownLink(this.titelKurz, this.pfad)
  }
}

export class AufgabenSammlung {
  aufgaben: { [pfad: string]: Aufgabe }

  examenSammlung: ExamenSammlung

  constructor (examenSammlung: ExamenSammlung) {
    this.examenSammlung = examenSammlung
    this.aufgaben = {}
    const dateien = glob.sync('**/*.tex', { cwd: repositoryPfad })
    this.aufgaben = {}
    for (const pfad of dateien) {
      const aufgabe = this.erzeugeAufgabe(pfad)
      if (aufgabe) {
        this.aufgaben[macheRelativenPfad(pfad)] = aufgabe
      }
    }
  }

  istAufgabenPfad (pfad: string): boolean {
    return ExamensAufgabe.istExamensAufgabe(pfad) || Aufgabe.istAufgabe(pfad)
  }

  erzeugeAufgabe (pfad: string): Aufgabe | undefined {
    if (ExamensAufgabe.istExamensAufgabe(pfad)) {
      return new ExamensAufgabe(pfad, this.examenSammlung.gibDurchPfad(pfad))
    } else if (Aufgabe.istAufgabe(pfad)) {
      return new Aufgabe(pfad)
    }
  }

  gib (pfad: string): Aufgabe {
    return this.aufgaben[macheRelativenPfad(pfad)]
  }
}
