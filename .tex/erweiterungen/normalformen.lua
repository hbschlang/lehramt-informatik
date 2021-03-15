--local helfer = require('helfer')
local helfer = require('lehramt-informatik-helfer')

local function text_in_buchstaben_teilen (text)
  local ergebnis = {}
  if string.find(text, ',') then
    ergebnis = helfer.split(text, ' *, *')
  else
    for buchstabe in text:gmatch(".") do
      table.insert(ergebnis, buchstabe)
    end
  end
  return ergebnis
end

-- param eingang: A, B
-- return: { A, B }
-- 'nichts' wird durch \emptyset ersetzt
local function setze_menge (eingabe)

  eingabe = eingabe:gsub('nichts', '\\emptyset{}')
  local elemente = helfer.split(eingabe, '%s*,%s*')
  return '\\{ ' .. table.concat(elemente, ', ') .. ' \\}'
end

local function setze_funk_abhaengigkeit(eingabe, fuer_mathe)
  if fuer_mathe == nil then
    fuer_mathe = true
  end
  local seiten = helfer.split(eingabe, '%s*->%s*')
  local linke_seite = seiten[1]
  local rechte_seite = seiten[2]
  if fuer_mathe then
    return setze_menge(linke_seite) .. ' $\\rightarrow$ ' .. setze_menge(rechte_seite)
  else
    return '$' .. setze_menge(linke_seite) .. ' \\rightarrow ' .. setze_menge(rechte_seite) .. '$'
  end
end

local function drucke_funk_abhaengigkeiten(eingabe)
  local abhaengigkeiten = helfer.split(eingabe, '%s*;%s*')
  local ausgabe = ''
  for index, abhaengigkeit in ipairs(abhaengigkeiten) do
    ausgabe = ausgabe .. '\\item ' .. setze_funk_abhaengigkeit(abhaengigkeit) .. ' '
  end

  ausgabe = '\\begin{compactitem}' .. ausgabe .. '\\end{compactitem}'

  print(ausgabe)
  tex.print(ausgabe)
end

return {
  teilen = function (eingang)
    local buchstaben = text_in_buchstaben_teilen(eingang)
    local ergebnis = table.concat(buchstaben, ', ')
    return ergebnis
  end,
  drucke_funk_abhaengigkeit = function (eingabe, fuer_mathe)
    tex.print(setze_funk_abhaengigkeit(eingabe, fuer_mathe))
  end,
  drucke_funk_abhaengigkeiten = drucke_funk_abhaengigkeiten,
}
