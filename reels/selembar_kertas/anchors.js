// anchors: every story beat's time, read from the aligned words (never hardcoded seconds).
import { T, E } from '../../vendor/toon.js';

let A = null;
export function anchors() {
  if (A) return A;
  A = { wapres: T('Wapres'), mundur: T('mundur'), terakhir: T('Terakhir'), y1956: T('1956'), cerita: T('Ceritanya'), kertas: T('kertas'),
    surat: T('Surat'), sekolah: T('sekolah'), luar: T('luar'), setara: T('setara'), sma: T('SMA'),
    y2023: T('2023'), mk: T('MK'), buka: T('buka'), di40: T('40'), asal: T('asal'), rakyat: T('rakyat'),
    sembilan: T('Sembilan'), wali: T('Wali'), u36: T('36'), daftar: T('daftar'),
    menang: T('Menang'), juta1: T('96 juta'), suara1: T('suara'),
    tapi: T('Tapi'), advokat: T('advokat'), gugat: T('menggugat'), oktober: T('30 Oktober'), batal: T('membatalkannya'), kata: T('Kata'), bukti: T('bukti'), ketemu: T('ketemu'),
    lalu: T('Lalu'), n120: T('120'), anggota: T('anggota'), teken: T('teken'), pintu2: T('pintu', 2), makzul: T('pemakzulan'),
    nov: T('12 November'), sebelum: T('sebelum'), mundur2: T('mundur', 2), tanpa: T('Tanpa'),
    sekarang: T('Sekarang'), dua: T('dua'), mpr: T('MPR'), pilih: T('pilih'), satu: T('satu'),
    juta2: T('96 juta', 2), lama: T('lama'), pengganti: T('Penggantinya'), n732: T('732'), lo: T('Lo'), termasuk: T('termasuk'), end: E('termasuk') };
  return A;
}

