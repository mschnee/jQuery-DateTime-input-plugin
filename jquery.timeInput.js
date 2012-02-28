function setlocale (category, locale) {
    // http://kevin.vanzonneveld.net
    // +   original by: Brett Zamir (http://brett-zamir.me)
    // +   derived from: Blues at http://hacks.bluesmoon.info/strftime/strftime.js
    // +   derived from: YUI Library: http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html
    // -    depends on: getenv
    // %          note 1: Is extensible, but currently only implements locales en,
    // %          note 1: en_US, en_GB, en_AU, fr, and fr_CA for LC_TIME only; C for LC_CTYPE;
    // %          note 1: C and en for LC_MONETARY/LC_NUMERIC; en for LC_COLLATE
    // %          note 2: Uses global: php_js to store locale info
    // %          note 3: Consider using http://demo.icu-project.org/icu-bin/locexp as basis for localization (as in i18n_loc_set_default())
    // *     example 1: setlocale('LC_ALL', 'en_US');
    // *     returns 1: 'en_US'
    var categ = '',
        cats = [],
        i = 0,
        d = this.window.document;

    // BEGIN STATIC
    var _copy = function _copy(orig) {
        if (orig instanceof RegExp) {
            return new RegExp(orig);
        } else if (orig instanceof Date) {
            return new Date(orig);
        }
        var newObj = {};
        for (var i in orig) {
            if (typeof orig[i] === 'object') {
                newObj[i] = _copy(orig[i]);
            } else {
                newObj[i] = orig[i];
            }
        }
        return newObj;
    };

    // Function usable by a ngettext implementation (apparently not an accessible part of setlocale(), but locale-specific)
    // See http://www.gnu.org/software/gettext/manual/gettext.html#Plural-forms though amended with others from
    // https://developer.mozilla.org/En/Localization_and_Plurals (new categories noted with "MDC" below, though
    // not sure of whether there is a convention for the relative order of these newer groups as far as ngettext)
    // The function name indicates the number of plural forms (nplural)
    // Need to look into http://cldr.unicode.org/ (maybe future JavaScript); Dojo has some functions (under new BSD),
    // including JSON conversions of LDML XML from CLDR: http://bugs.dojotoolkit.org/browser/dojo/trunk/cldr
    // and docs at http://api.dojotoolkit.org/jsdoc/HEAD/dojo.cldr
    var _nplurals1 = function (n) { // e.g., Japanese
        return 0;
    };
    var _nplurals2a = function (n) { // e.g., English
        return n !== 1 ? 1 : 0;
    };
    var _nplurals2b = function (n) { // e.g., French
        return n > 1 ? 1 : 0;
    };
    var _nplurals2c = function (n) { // e.g., Icelandic (MDC)
        return n % 10 === 1 && n % 100 !== 11 ? 0 : 1;
    };
    var _nplurals3a = function (n) { // e.g., Latvian (MDC has a different order from gettext)
        return n % 10 === 1 && n % 100 !== 11 ? 0 : n !== 0 ? 1 : 2;
    };
    var _nplurals3b = function (n) { // e.g., Scottish Gaelic
        return n === 1 ? 0 : n === 2 ? 1 : 2;
    };
    var _nplurals3c = function (n) { // e.g., Romanian
        return n === 1 ? 0 : (n === 0 || (n % 100 > 0 && n % 100 < 20)) ? 1 : 2;
    };
    var _nplurals3d = function (n) { // e.g., Lithuanian (MDC has a different order from gettext)
        return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    };
    var _nplurals3e = function (n) { // e.g., Croatian
        return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    };
    var _nplurals3f = function (n) { // e.g., Slovak
        return n === 1 ? 0 : n >= 2 && n <= 4 ? 1 : 2;
    };
    var _nplurals3g = function (n) { // e.g., Polish
        return n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2;
    };
    var _nplurals3h = function (n) { // e.g., Macedonian (MDC)
        return n % 10 === 1 ? 0 : n % 10 === 2 ? 1 : 2;
    };
    var _nplurals4a = function (n) { // e.g., Slovenian
        return n % 100 === 1 ? 0 : n % 100 === 2 ? 1 : n % 100 === 3 || n % 100 === 4 ? 2 : 3;
    };
    var _nplurals4b = function (n) { // e.g., Maltese (MDC)
        return n === 1 ? 0 : n === 0 || (n % 100 && n % 100 <= 10) ? 1 : n % 100 >= 11 && n % 100 <= 19 ? 2 : 3;
    };
    var _nplurals5 = function (n) { // e.g., Irish Gaeilge (MDC)
        return n === 1 ? 0 : n === 2 ? 1 : n >= 3 && n <= 6 ? 2 : n >= 7 && n <= 10 ? 3 : 4;
    };
    var _nplurals6 = function (n) { // e.g., Arabic (MDC) - Per MDC puts 0 as last group
        return n === 0 ? 5 : n === 1 ? 0 : n === 2 ? 1 : n % 100 >= 3 && n % 100 <= 10 ? 2 : n % 100 >= 11 && n % 100 <= 99 ? 3 : 4;
    };
    // END STATIC
    // BEGIN REDUNDANT
    this.php_js = this.php_js || {};

    var phpjs = this.php_js;

    // Reconcile Windows vs. *nix locale names?
    // Allow different priority orders of languages, esp. if implement gettext as in
    //     LANGUAGE env. var.? (e.g., show German if French is not available)
    if (!phpjs.locales) {
        // Can add to the locales
        phpjs.locales = {};

        phpjs.locales.en = {
            'LC_COLLATE': // For strcoll


            function (str1, str2) { // Fix: This one taken from strcmp, but need for other locales; we don't use localeCompare since its locale is not settable
                return (str1 == str2) ? 0 : ((str1 > str2) ? 1 : -1);
            },
            'LC_CTYPE': { // Need to change any of these for English as opposed to C?
                an: /^[A-Za-z\d]+$/g,
                al: /^[A-Za-z]+$/g,
                ct: /^[\u0000-\u001F\u007F]+$/g,
                dg: /^[\d]+$/g,
                gr: /^[\u0021-\u007E]+$/g,
                lw: /^[a-z]+$/g,
                pr: /^[\u0020-\u007E]+$/g,
                pu: /^[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007E]+$/g,
                sp: /^[\f\n\r\t\v ]+$/g,
                up: /^[A-Z]+$/g,
                xd: /^[A-Fa-f\d]+$/g,
                CODESET: 'UTF-8',
                // Used by sql_regcase
                lower: 'abcdefghijklmnopqrstuvwxyz',
                upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            },
            'LC_TIME': { // Comments include nl_langinfo() constant equivalents and any changes from Blues' implementation
                a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                // ABDAY_
                A: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                // DAY_
                b: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                // ABMON_
                B: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                // MON_
                c: '%a %d %b %Y %r %Z',
                // D_T_FMT // changed %T to %r per results
                p: ['AM', 'PM'],
                // AM_STR/PM_STR
                P: ['am', 'pm'],
                // Not available in nl_langinfo()
                r: '%I:%M:%S %p',
                // T_FMT_AMPM (Fixed for all locales)
                x: '%m/%d/%Y',
                // D_FMT // switched order of %m and %d; changed %y to %Y (C uses %y)
                X: '%r',
                // T_FMT // changed from %T to %r  (%T is default for C, not English US)
                // Following are from nl_langinfo() or http://www.cptec.inpe.br/sx4/sx4man2/g1ab02e/strftime.4.html
                alt_digits: '',
                // e.g., ordinal
                ERA: '',
                ERA_YEAR: '',
                ERA_D_T_FMT: '',
                ERA_D_FMT: '',
                ERA_T_FMT: ''
            },
            // Assuming distinction between numeric and monetary is thus:
            // See below for C locale
            'LC_MONETARY': { // Based on Windows "english" (English_United States.1252) locale
                int_curr_symbol: 'USD',
                currency_symbol: '$',
                mon_decimal_point: '.',
                mon_thousands_sep: ',',
                mon_grouping: [3],
                // use mon_thousands_sep; "" for no grouping; additional array members indicate successive group lengths after first group (e.g., if to be 1,23,456, could be [3, 2])
                positive_sign: '',
                negative_sign: '-',
                int_frac_digits: 2,
                // Fractional digits only for money defaults?
                frac_digits: 2,
                p_cs_precedes: 1,
                // positive currency symbol follows value = 0; precedes value = 1
                p_sep_by_space: 0,
                // 0: no space between curr. symbol and value; 1: space sep. them unless symb. and sign are adjacent then space sep. them from value; 2: space sep. sign and value unless symb. and sign are adjacent then space separates
                n_cs_precedes: 1,
                // see p_cs_precedes
                n_sep_by_space: 0,
                // see p_sep_by_space
                p_sign_posn: 3,
                // 0: parentheses surround quantity and curr. symbol; 1: sign precedes them; 2: sign follows them; 3: sign immed. precedes curr. symbol; 4: sign immed. succeeds curr. symbol
                n_sign_posn: 0 // see p_sign_posn
            },
            'LC_NUMERIC': { // Based on Windows "english" (English_United States.1252) locale
                decimal_point: '.',
                thousands_sep: ',',
                grouping: [3] // see mon_grouping, but for non-monetary values (use thousands_sep)
            },
            'LC_MESSAGES': {
                YESEXPR: '^[yY].*',
                NOEXPR: '^[nN].*',
                YESSTR: '',
                NOSTR: ''
            },
            nplurals: _nplurals2a
        };
        phpjs.locales.en_US = _copy(phpjs.locales.en);
        phpjs.locales.en_US.LC_TIME.c = '%a %d %b %Y %r %Z';
        phpjs.locales.en_US.LC_TIME.x = '%D';
        phpjs.locales.en_US.LC_TIME.X = '%r';
        // The following are based on *nix settings
        phpjs.locales.en_US.LC_MONETARY.int_curr_symbol = 'USD ';
        phpjs.locales.en_US.LC_MONETARY.p_sign_posn = 1;
        phpjs.locales.en_US.LC_MONETARY.n_sign_posn = 1;
        phpjs.locales.en_US.LC_MONETARY.mon_grouping = [3, 3];
        phpjs.locales.en_US.LC_NUMERIC.thousands_sep = '';
        phpjs.locales.en_US.LC_NUMERIC.grouping = [];

        phpjs.locales.en_GB = _copy(phpjs.locales.en);
        phpjs.locales.en_GB.LC_TIME.r = '%l:%M:%S %P %Z';

        phpjs.locales.en_AU = _copy(phpjs.locales.en_GB);
        phpjs.locales.C = _copy(phpjs.locales.en); // Assume C locale is like English (?) (We need C locale for LC_CTYPE)
        phpjs.locales.C.LC_CTYPE.CODESET = 'ANSI_X3.4-1968';
        phpjs.locales.C.LC_MONETARY = {
            int_curr_symbol: '',
            currency_symbol: '',
            mon_decimal_point: '',
            mon_thousands_sep: '',
            mon_grouping: [],
            p_cs_precedes: 127,
            p_sep_by_space: 127,
            n_cs_precedes: 127,
            n_sep_by_space: 127,
            p_sign_posn: 127,
            n_sign_posn: 127,
            positive_sign: '',
            negative_sign: '',
            int_frac_digits: 127,
            frac_digits: 127
        };
        phpjs.locales.C.LC_NUMERIC = {
            decimal_point: '.',
            thousands_sep: '',
            grouping: []
        };
        phpjs.locales.C.LC_TIME.c = '%a %b %e %H:%M:%S %Y'; // D_T_FMT
        phpjs.locales.C.LC_TIME.x = '%m/%d/%y'; // D_FMT
        phpjs.locales.C.LC_TIME.X = '%H:%M:%S'; // T_FMT
        phpjs.locales.C.LC_MESSAGES.YESEXPR = '^[yY]';
        phpjs.locales.C.LC_MESSAGES.NOEXPR = '^[nN]';

        phpjs.locales.fr = _copy(phpjs.locales.en);
        phpjs.locales.fr.nplurals = _nplurals2b;
        phpjs.locales.fr.LC_TIME.a = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
        phpjs.locales.fr.LC_TIME.A = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        phpjs.locales.fr.LC_TIME.b = ['jan', 'f\u00E9v', 'mar', 'avr', 'mai', 'jun', 'jui', 'ao\u00FB', 'sep', 'oct', 'nov', 'd\u00E9c'];
        phpjs.locales.fr.LC_TIME.B = ['janvier', 'f\u00E9vrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'ao\u00FBt', 'septembre', 'octobre', 'novembre', 'd\u00E9cembre'];
        phpjs.locales.fr.LC_TIME.c = '%a %d %b %Y %T %Z';
        phpjs.locales.fr.LC_TIME.p = ['', ''];
        phpjs.locales.fr.LC_TIME.P = ['', ''];
        phpjs.locales.fr.LC_TIME.x = '%d.%m.%Y';
        phpjs.locales.fr.LC_TIME.X = '%T';

        phpjs.locales.fr_CA = _copy(phpjs.locales.fr);
        phpjs.locales.fr_CA.LC_TIME.x = '%Y-%m-%d';
    }
    if (!phpjs.locale) {
        phpjs.locale = 'en_US';
        var NS_XHTML = 'http://www.w3.org/1999/xhtml';
        var NS_XML = 'http://www.w3.org/XML/1998/namespace';
        if (d.getElementsByTagNameNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0]) {
            if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS && d.getElementsByTagNameNS(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang')) {
                phpjs.locale = d.getElementsByTagName(NS_XHTML, 'html')[0].getAttributeNS(NS_XML, 'lang');
            } else if (d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang) { // XHTML 1.0 only
                phpjs.locale = d.getElementsByTagNameNS(NS_XHTML, 'html')[0].lang;
            }
        } else if (d.getElementsByTagName('html')[0] && d.getElementsByTagName('html')[0].lang) {
            phpjs.locale = d.getElementsByTagName('html')[0].lang;
        }
    }
    phpjs.locale = phpjs.locale.replace('-', '_'); // PHP-style
    // Fix locale if declared locale hasn't been defined
    if (!(phpjs.locale in phpjs.locales)) {
        if (phpjs.locale.replace(/_[a-zA-Z]+$/, '') in phpjs.locales) {
            phpjs.locale = phpjs.locale.replace(/_[a-zA-Z]+$/, '');
        }
    }

    if (!phpjs.localeCategories) {
        phpjs.localeCategories = {
            'LC_COLLATE': phpjs.locale,
            // for string comparison, see strcoll()
            'LC_CTYPE': phpjs.locale,
            // for character classification and conversion, for example strtoupper()
            'LC_MONETARY': phpjs.locale,
            // for localeconv()
            'LC_NUMERIC': phpjs.locale,
            // for decimal separator (See also localeconv())
            'LC_TIME': phpjs.locale,
            // for date and time formatting with strftime()
            'LC_MESSAGES': phpjs.locale // for system responses (available if PHP was compiled with libintl)
        };
    }
    // END REDUNDANT
    if (locale === null || locale === '') {
        locale = this.getenv(category) || this.getenv('LANG');
    } else if (Object.prototype.toString.call(locale) === '[object Array]') {
        for (i = 0; i < locale.length; i++) {
            if (!(locale[i] in this.php_js.locales)) {
                if (i === locale.length - 1) {
                    return false; // none found
                }
                continue;
            }
            locale = locale[i];
            break;
        }
    }

    // Just get the locale
    if (locale === '0' || locale === 0) {
        if (category === 'LC_ALL') {
            for (categ in this.php_js.localeCategories) {
                cats.push(categ + '=' + this.php_js.localeCategories[categ]); // Add ".UTF-8" or allow ".@latint", etc. to the end?
            }
            return cats.join(';');
        }
        return this.php_js.localeCategories[category];
    }

    if (!(locale in this.php_js.locales)) {
        return false; // Locale not found
    }

    // Set and get locale
    if (category === 'LC_ALL') {
        for (categ in this.php_js.localeCategories) {
            this.php_js.localeCategories[categ] = locale;
        }
    } else {
        this.php_js.localeCategories[category] = locale;
    }
    return locale;
}

function strftime (fmt, timestamp) {
    // http://kevin.vanzonneveld.net
    // +      original by: Blues (http://tech.bluesmoon.info/)
    // + reimplemented by: Brett Zamir (http://brett-zamir.me)
    // +   input by: Alex
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // -       depends on: setlocale
    // %        note 1: Uses global: php_js to store locale info
    // *        example 1: strftime("%A", 1062462400); // Return value will depend on date and locale
    // *        returns 1: 'Tuesday'
    // BEGIN REDUNDANT
    this.php_js = this.php_js || {};
    this.setlocale('LC_ALL', 0); // ensure setup of localization variables takes place
    // END REDUNDANT
    var phpjs = this.php_js;

    // BEGIN STATIC
    var _xPad = function (x, pad, r) {
        if (typeof r === 'undefined') {
            r = 10;
        }
        for (; parseInt(x, 10) < r && r > 1; r /= 10) {
            x = pad.toString() + x;
        }
        return x.toString();
    };

    var locale = phpjs.localeCategories.LC_TIME;
    var locales = phpjs.locales;
    var lc_time = locales[locale].LC_TIME;

    var _formats = {
        a: function (d) {
            return lc_time.a[d.getDay()];
        },
        A: function (d) {
            return lc_time.A[d.getDay()];
        },
        b: function (d) {
            return lc_time.b[d.getMonth()];
        },
        B: function (d) {
            return lc_time.B[d.getMonth()];
        },
        C: function (d) {
            return _xPad(parseInt(d.getFullYear() / 100, 10), 0);
        },
        d: ['getDate', '0'],
        e: ['getDate', ' '],
        g: function (d) {
            return _xPad(parseInt(this.G(d) / 100, 10), 0);
        },
        G: function (d) {
            var y = d.getFullYear();
            var V = parseInt(_formats.V(d), 10);
            var W = parseInt(_formats.W(d), 10);

            if (W > V) {
                y++;
            } else if (W === 0 && V >= 52) {
                y--;
            }

            return y;
        },
        H: ['getHours', '0'],
        I: function (d) {
            var I = d.getHours() % 12;
            return _xPad(I === 0 ? 12 : I, 0);
        },
        j: function (d) {
            var ms = d - new Date('' + d.getFullYear() + '/1/1 GMT');
            ms += d.getTimezoneOffset() * 60000; // Line differs from Yahoo implementation which would be equivalent to replacing it here with:
            // ms = new Date('' + d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' GMT') - ms;
            var doy = parseInt(ms / 60000 / 60 / 24, 10) + 1;
            return _xPad(doy, 0, 100);
        },
        k: ['getHours', '0'],
        // not in PHP, but implemented here (as in Yahoo)
        l: function (d) {
            var l = d.getHours() % 12;
            return _xPad(l === 0 ? 12 : l, ' ');
        },
        m: function (d) {
            return _xPad(d.getMonth() + 1, 0);
        },
        M: ['getMinutes', '0'],
        p: function (d) {
            return lc_time.p[d.getHours() >= 12 ? 1 : 0];
        },
        P: function (d) {
            return lc_time.P[d.getHours() >= 12 ? 1 : 0];
        },
        s: function (d) { // Yahoo uses return parseInt(d.getTime()/1000, 10);
            return Date.parse(d) / 1000;
        },
        S: ['getSeconds', '0'],
        u: function (d) {
            var dow = d.getDay();
            return ((dow === 0) ? 7 : dow);
        },
        U: function (d) {
            var doy = parseInt(_formats.j(d), 10);
            var rdow = 6 - d.getDay();
            var woy = parseInt((doy + rdow) / 7, 10);
            return _xPad(woy, 0);
        },
        V: function (d) {
            var woy = parseInt(_formats.W(d), 10);
            var dow1_1 = (new Date('' + d.getFullYear() + '/1/1')).getDay();
            // First week is 01 and not 00 as in the case of %U and %W,
            // so we add 1 to the final result except if day 1 of the year
            // is a Monday (then %W returns 01).
            // We also need to subtract 1 if the day 1 of the year is
            // Friday-Sunday, so the resulting equation becomes:
            var idow = woy + (dow1_1 > 4 || dow1_1 <= 1 ? 0 : 1);
            if (idow === 53 && (new Date('' + d.getFullYear() + '/12/31')).getDay() < 4) {
                idow = 1;
            } else if (idow === 0) {
                idow = _formats.V(new Date('' + (d.getFullYear() - 1) + '/12/31'));
            }
            return _xPad(idow, 0);
        },
        w: 'getDay',
        W: function (d) {
            var doy = parseInt(_formats.j(d), 10);
            var rdow = 7 - _formats.u(d);
            var woy = parseInt((doy + rdow) / 7, 10);
            return _xPad(woy, 0, 10);
        },
        y: function (d) {
            return _xPad(d.getFullYear() % 100, 0);
        },
        Y: 'getFullYear',
        z: function (d) {
            var o = d.getTimezoneOffset();
            var H = _xPad(parseInt(Math.abs(o / 60), 10), 0);
            var M = _xPad(o % 60, 0);
            return (o > 0 ? '-' : '+') + H + M;
        },
        Z: function (d) {
            return d.toString().replace(/^.*\(([^)]+)\)$/, '$1');
/*
            // Yahoo's: Better?
            var tz = d.toString().replace(/^.*:\d\d( GMT[+-]\d+)? \(?([A-Za-z ]+)\)?\d*$/, '$2').replace(/[a-z ]/g, '');
            if(tz.length > 4) {
                tz = Dt.formats.z(d);
            }
            return tz;
            */
        },
        '%': function (d) {
            return '%';
        }
    };
    // END STATIC
/* Fix: Locale alternatives are supported though not documented in PHP; see http://linux.die.net/man/3/strptime
Ec
EC
Ex
EX
Ey
EY
Od or Oe
OH
OI
Om
OM
OS
OU
Ow
OW
Oy
*/

    var _date = ((typeof(timestamp) == 'undefined') ? new Date() : // Not provided
    (typeof(timestamp) == 'object') ? new Date(timestamp) : // Javascript Date()
    new Date(timestamp * 1000) // PHP API expects UNIX timestamp (auto-convert to int)
    );

    var _aggregates = {
        c: 'locale',
        D: '%m/%d/%y',
        F: '%y-%m-%d',
        h: '%b',
        n: '\n',
        r: 'locale',
        R: '%H:%M',
        t: '\t',
        T: '%H:%M:%S',
        x: 'locale',
        X: 'locale'
    };


    // First replace aggregates (run in a loop because an agg may be made up of other aggs)
    while (fmt.match(/%[cDFhnrRtTxX]/)) {
        fmt = fmt.replace(/%([cDFhnrRtTxX])/g, function (m0, m1) {
            var f = _aggregates[m1];
            return (f === 'locale' ? lc_time[m1] : f);
        });
    }

    // Now replace formats - we need a closure so that the date object gets passed through
    var str = fmt.replace(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/g, function (m0, m1) {
        var f = _formats[m1];
        if (typeof f === 'string') {
            return _date[f]();
        } else if (typeof f === 'function') {
            return f(_date);
        } else if (typeof f === 'object' && typeof(f[0]) === 'string') {
            return _xPad(_date[f[0]](), f[1]);
        } else { // Shouldn't reach here
            return m1;
        }
    });
    return str;
}

/**
 * strtodate was originally strtotime from phpjs.org
 * I modified it to accept a Date() as a parameter for `now` and to return a 
 * Date() instead of a timestamp.
 */
function strtodate (str, now) {
    // http://kevin.vanzonneveld.net
    // +   original by: Caio Ariede (http://caioariede.com)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: David
    // +   improved by: Caio Ariede (http://caioariede.com)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Wagner B. Soares
    // +   bugfixed by: Artur Tchernychev
    // ++  improved by: Matthew Schnee <matthew.schnee@gmail.com> to accept a Date object as the `now` parameter. 
    // %        note 1: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
    // *     example 1: strtotime('+1 day', 1129633200);
    // *     returns 1: 1129719600
    // *     example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
    // *     returns 2: 1130425202
    // *     example 3: strtotime('last month', 1129633200);
    // *     returns 3: 1127041200
    // *     example 4: strtotime('2009-05-04 08:30:00');
    // *     returns 4: 1241418600
    var i, l, match, s, parse = '';

    str = str.replace(/\s{2,}|^\s|\s$/g, ' '); // unecessary spaces
    str = str.replace(/[\t\r\n]/g, ''); // unecessary chars
    if (str === 'now') {
        return now === null || isNaN(now) ? new Date().getTime() / 1000 | 0 : now | 0;
    } else if (!isNaN(parse = Date.parse(str))) {
        return new Date(str);
    } else if (now) {
        now = (typeof(timestamp) == 'object') ? new Date(now):new Date(now * 1000); // Accept PHP-style seconds
    } else {
        now = new Date();
    }

    str = str.toLowerCase();

    var __is = {
        day: {
            'sun': 0,
            'mon': 1,
            'tue': 2,
            'wed': 3,
            'thu': 4,
            'fri': 5,
            'sat': 6
        },
        mon: [
            'jan',
            'feb',
            'mar',
            'apr',
            'may',
            'jun',
            'jul',
            'aug',
            'sep',
            'oct',
            'nov',
            'dec'
        ]
    };

    var process = function (m) {
        var ago = (m[2] && m[2] === 'ago');
        var num = (num = m[0] === 'last' ? -1 : 1) * (ago ? -1 : 1);
        
        switch (m[0]) {
        case 'last':
        case 'next':
            switch (m[1].substring(0, 3)) {
            case 'yea':
                now.setFullYear(now.getFullYear() + num);
                break;
            case 'wee':
                now.setDate(now.getDate() + (num * 7));
                break;
            case 'day':
                now.setDate(now.getDate() + num);
                break;
            case 'hou':
                now.setHours(now.getHours() + num);
                break;
            case 'min':
                now.setMinutes(now.getMinutes() + num);
                break;
            case 'sec':
                now.setSeconds(now.getSeconds() + num);
                break;
            case 'mon':
                if (m[1] === "month") {
                    now.setMonth(now.getMonth() + num);
                    break;
                }
                // fall through
            default:
                var day = __is.day[m[1].substring(0, 3)];
                if (typeof day !== 'undefined') {
                    var diff = day - now.getDay();
                    if (diff === 0) {
                        diff = 7 * num;
                    } else if (diff > 0) {
                        if (m[0] === 'last') {
                            diff -= 7;
                        }
                    } else {
                        if (m[0] === 'next') {
                            diff += 7;
                        }
                    }
                    now.setDate(now.getDate() + diff);
                    now.setHours(0, 0, 0, 0); // when jumping to a specific last/previous day of week, PHP sets the time to 00:00:00
                }
            }
            break;

        default:
            if (/\d+/.test(m[0])) {
                num *= parseInt(m[0], 10);

                switch (m[1].substring(0, 3)) {
                case 'yea':
                    now.setFullYear(now.getFullYear() + num);
                    break;
                case 'mon':
                    now.setMonth(now.getMonth() + num);
                    break;
                case 'wee':
                    now.setDate(now.getDate() + (num * 7));
                    break;
                case 'day':
                    now.setDate(now.getDate() + num);
                    break;
                case 'hou':
                    now.setHours(now.getHours() + num);
                    break;
                case 'min':
                    now.setMinutes(now.getMinutes() + num);
                    break;
                case 'sec':
                    now.setSeconds(now.getSeconds() + num);
                    break;
                }
            } else {
                return false;
            }
            break;
        }
        return true;
    };

    match = str.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/);
    if (match !== null) {
        if (!match[2]) {
            match[2] = '00:00:00';
        } else if (!match[3]) {
            match[2] += ':00';
        }

        s = match[1].split(/-/g);

        s[1] = __is.mon[s[1] - 1] || s[1];
        s[0] = +s[0];

        s[0] = (s[0] >= 0 && s[0] <= 69) ? '20' + (s[0] < 10 ? '0' + s[0] : s[0] + '') : (s[0] >= 70 && s[0] <= 99) ? '19' + s[0] : s[0] + '';
        return parseInt(this.strtotime(s[2] + ' ' + s[1] + ' ' + s[0] + ' ' + match[2]) + (match[4] ? match[4] / 1000 : ''), 10);
    }

    var regex = '([+-]?\\d+\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)' + '|(last|next)\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))' + '(\\sago)?';

    match = str.match(new RegExp(regex, 'gi')); // Brett: seems should be case insensitive per docs, so added 'i'
    if (match === null) {
        return false;
    }

    for (i = 0, l = match.length; i < l; i++) {
        if (!process(match[i].split(' '))) {
            return false;
        }
    }

    return now;
}

/**
 * jQuery.timeInput.js v0.0.1
 * 
 * Copyright (C) 2012 Matthew Schnee <matthew.schnee@gmail.com>
 * 
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 * 
 * Requires jQuery.
 * Includes setlocale from php.js
 * Includes strftime from php.js
 * 
 * Internally, all of these have a "date" component and a "time" component.
 * Each component is self-incrementing; that is, pressing up and down on the minutes
 * should roll up the hours when you pass above 59 or below 0, and then wrap.
 */
(function($){
    /* from jquery UI */
    $.extend($.expr[':'], {
        focusable: function(element) {
            var nodeName = element.nodeName.toLowerCase(),
             tabIndex = $.attr(element, 'tabindex');
             return (/input|select|textarea|button|object/.test(nodeName)
             ? !element.disabled
             : 'a' == nodeName || 'area' == nodeName
             ? element.href || !isNaN(tabIndex)
             : !isNaN(tabIndex))
    // the element and all of its ancestors must be visible
    // the browser may report that the area is hidden
    && !$(element)['area' == nodeName ? 'parents' : 'closest'](':hidden').length;
        }
    });

    /* these are essentially static parameters */
    var token_re=/[aAbBCdeHIjmMpSuUVwWyY]/
    var aggregate_re=/[cDFhnrRtTxX]/;
    
    // phpjs stuff
    this.php_js = this.php_js || {};
    var phpjs = this.php_js;
    this.setlocale('LC_ALL', 0); // ensure setup of localization variables takes place
    var _locale = phpjs.localeCategories.LC_TIME;
    var _locales = phpjs.locales;
    var _lc_time = _locales[_locale].LC_TIME;
    var _aggregates = {
        c: 'locale',
        D: '%m/%d/%y',
        F: '%y-%m-%d',
        h: '%b',
        n: '\n',
        r: 'locale',
        R: '%H:%M',
        t: '\t',
        T: '%H:%M:%S',
        x: 'locale',
        X: 'locale'
    };
           
    /**
     * This object array references the worker functions for incrementing/decrementing time.
     */
    var _mfn = {
        a: _m_day,
        A: _m_day,
        d: _m_day,
        e: _m_day,
        j: _m_day,
        u: _m_day,
        w: _m_day,
        b: _m_month,
        B: _m_month,
        h: _m_month,
        m: _m_month,
        C: _m_century,
        g: _m_year,
        G: _m_year,
        y: _m_year,
        Y: _m_year,
        H: _m_hour,
        I: _m_hour,
        l: _m_hour,
        p: _m_meridian,
        P: _m_meridian,
        M: _m_minute,
        S: _m_second,
        s: _m_second,
        z: _m_zone,
        Z: _m_zone
    }
    
    function _m_day(data,inc) {
        return new Date(data.ds.getTime()+(inc?86400000:-86400000));
    }
    
    function _m_month(data,inc) {
        var m = data.ds.getMonth()+(inc?1:-1), // 0 to 11
            ret = new Date(data.ds);
        if(m<0) {
            ret.setFullYear(data.ds.getFullYear()-1);
            m=11
        } else if (m > 11) {
            ret.setFullYear(data.ds.getFullYear()+1);
            m=0;
        } 
        ret.setMonth(m);
        return ret;
    }
    
    function _m_year(data,inc) {
        var ret = new Date(data.ds);
        if(inc) {
            ret.setFullYear(data.ds.getFullYear()+1);
        } else {
            ret.setFullYear(data.ds.getFullYear()-1);
        }
        return ret;
    }
    function _m_century(data,inc) {
        var ret = new Date(data.ds);
        if(inc) {
            ret.setFullYear(data.ds.getFullYear()+100);
        } else {
            ret.setFullYear(data.ds.getFullYear()-100);
        }
        return ret;
    }
    
    function _m_hour(data,inc) {
        return new Date(data.ds.getTime()+(inc?3600000:-3600000));
    }
    function _m_minute(data,inc) {
        return new Date(data.ds.getTime()+(inc?60000:-60000));
    }
    function _m_second(data,inc) {
        return new Date(data.ds.getTime()+(inc?1000:-1000));
    }
    function _m_meridian(data,inc) {
        var ret = new Date(data.ds);
        if(inc) {
            if(ret.getHours>=12) {
                if(data.meridianIncrementsDay) {
                    ret.setHours(ret.getHours()+12);
                } else {
                    ret.setHours(ret.getHours()-12);
                }
            } else {
                ret.setHours(ret.getHours()+12);
            }
        } else {
            if(ret.getHours<12) {
                if(data.meridianIncrementsDay) {
                    ret.setHours(ret.getHours()-12);
                } else {
                    ret.setHours(ret.getHours()+12);
                }
            } else {
                ret.setHours(ret.getHours()-12);
            }
        }
        return ret;
        
    }
    
    /* currently unimplemented */
    function _m_zone(data,inc) {
        return data.ds;
    }
    
    
    function utcdate(format,dateObject,offset) {

        var f =strftime(format,new Date(dateObject.getTime()+offset)); 
        return f;
    }
    /**
     * This needs to be called asynchronously, AFTER the input has been handled.
     */
    function selectRange(element,start,end) {
        if(element.setSelectionRange) { // Mozilla
            element.focus();
            element.select();
            element.setSelectionRange(start, end,"none");
        } else if(document.selection) { // IE (and Opera?)
            element.focus();
            element.select();
            var block = document.selection.createRange();
            block.collapse(true);
            block.moveEnd('character', end);
            block.moveStart('character', start);
            block.select();
        } else {
            // possible fallback
        }
    }
    
    function selectToken(data,currentToken) {
        var currentCharIndex = 0;
        for(var i=0; i<currentToken;i++) {
            currentCharIndex+=(data.tokens[i].r?utcdate("%"+data.tokens[i].v,data.ds,data.timezoneOffset).trim():data.tokens[i].v).length
        }
        var tokenValue = data.tokens[i].v;
        var endCharIndex = currentCharIndex+(data.tokens[currentToken].r?utcdate("%"+data.tokens[currentToken].v,data.ds,data.timezoneOffset).trim():data.tokens[currentToken].v).length;
        setTimeout(function(){selectRange(data.element,currentCharIndex,endCharIndex)},0);
    }
    
    /* old */
/*    
    /**
     * Increments token.
     */
    function selectNextToken(Self) {
        var data = Self.data('timeInput');
        var currentSelection = data.currentToken;
        
        data.currentToken++;        
        if (data.currentToken >= data.tokens.length ) {
            data.currentToken = data.tokens.length-1;
        }else if (data.currentToken <= 0 ) {
            data.currentToken = 0;
        }
        
        for(var i=data.currentToken;i<data.tokens.length;i++) {
            if( !data.tokens[i].r || !data.tokens[i].i ) {
                data.currentToken++;
            } else {
                break
            }
        }
        
        
        if(data.currentToken >= data.tokens.length) {
            data.currentToken = currentSelection;
            return false; // doesn't move
        }
        return true; // moves
        
    }    
    
    /**
     * Decrement's token.
     */
    function selectPrevToken(Self) {
        var data = Self.data('timeInput');
        data.currentToken--;
        if (data.currentToken >= data.tokens.length ) {
            data.currentToken = data.tokens.length-1;
        }else if (data.currentToken <= 0 ) {
            data.currentToken = 0;
            return false;
        }
        
        // extra processing for decrement since we count up from 0 for lengths.
        for(var i=data.currentToken; i>=0;i--) {
            if( !data.tokens[i].r || !data.tokens[i].i ) {
                data.currentToken--;
            } else {
                break;
            }
        }
        if(data.currentToken <0)
            return false;
        return true;
    }
    
    function incrementToken(Self) {
        var data = Self.data('timeInput');
        data.ds = _mfn[data.tokens[data.currentToken].v].call(null,data,true);
        Self.timeInput("updateDisplay");
        selectToken(data,data.currentToken);
        Self.trigger('change');
    }
    
    function decrementToken(Self) {
        var data = Self.data('timeInput');
        data.ds = _mfn[data.tokens[data.currentToken].v].call(null,data,false);
        Self.timeInput("updateDisplay");
        selectToken(data,data.currentToken);
        Self.trigger('change');
    }
    
    var _current = new Date();
    
    var methods = {
        
        /** 
         * Initialize each input element.
         * 
         * This function takes care of all the setup necessary to convert the
         * format string into useful tokens and sets up input handling.
         */
        init: function(params) {
            var settings = $.extend({
                displayFormat: "%m/%d/%y %I:%M %p",         /* the format according to strftime() */
                defaultIsMidnight: false,   /* use the current time (true) or midnight(false) as a fallback */
                meridianIncrementsDay: false, /* roll 11pm on the 23rd to 11am on the 24th */
                timezoneOffset: _current.getTimezoneOffset(),
                tabIncrementsSelection: true,   /* tab advances like right-arrow */
                returnCompletesInput: true,     /* enter tells the document to move to the next focus, like tab would have */
                
            },params);
            
            return this.each(function(){
                var Self = $(this),
                    data = Self.data('timeInput');
                
                /*  Only initialize/tokenize each element once.
                    Also, we don't like invalid dates, so let Date() 
                    take care of all the dirty work.
                 */
                if( ! data ) {
                    Self.data('timeInput',$.extend({
                        element: this,
                        tokens: [],
                        ds: null,
                    },settings));
                    
                    data = Self.data('timeInput');
                    
                    // construct the Date object
                    data.ds = new Date(Self.val());
                    if(data.ds=="Invalid Date") {
                        data.ds = new Date(parseInt(Self.val()));
                    }
                    if(data.ds=="Invalid Date") {
                        data.ds = strtodate(Self.val(),new Date());
                    }
                    if(!data.ds || data.ds=="Invalid Date") {
                        data.ds = settings.defaultIsMidnight?new Date(_current.getFullYear(),_current.getMonth(),_current.getDate(),0,0,0,0):new Date()
                    }
                    
                    data.ds = new Date(data.ds.getTime()+data.timezoneOffset);
                    data.originalDate = data.ds;
                    
                    // tokenization.  First do string replacement according to phpjs.
                    while (settings.format.match(/%[cDFhnrRtTxX]/)) {
                        settings.format = settings.format.replace(/%([cDFhnrRtTxX])/g, function (m0, m1) {
                            var f = _aggregates[m1];
                            return (f === 'locale' ? _lc_time[m1] : f);
                        });
                    }

                    /**
                    * The tokens are made up ov objects:
                    * {
                    *  r: true/false, // replace.  is this a replacement?
                    *  v: "value"  // value :the filter used in replacement or the content of separation strings
                    *  i: true/false // interactive: if r is true, is this a component the user can interact with.
                    * }
                    * i is to denote fields that are to be replaced by strftime() but that we don't want the user 
                    * to input on, so we'll render it, but treat it as a separator.
                    */
                    var currentSep = ''; // the current separator
                    
                    /* 
                     * WARNING ABOUT TIME ZONES AND DAYLIGHT SAVINGS TIME
                     * 
                     * Time zone displays should not be editable or displayable.  Why?  Because JavaScript
                     * Date() knows absolutely nothing about Time, Dates, or zones.  This is because it's
                     * just a very dumb wrapper around some system implementations.  This means you could say
                     * "I want to edit some time for something that's in my current time zone".  Say you want to
                     * change somebody dirthday that happens to live in Arizona- Arizona has different DST rules
                     * than Colorado despite being, nominally, in the same timezone offset.  What will end up happening
                     * is that you can increment past the time you want to set, because the time may exist in Arizona,
                     * but it doesn't exist in your locale.
                     * 
                     * The good news is that this is a rendering problem and not an actualy "time" problem.  Time is 
                     * stored, internally, as a timestamp (milliseconds since the Epoch), so your system is going to be
                     * the monkey getting things wrong.  Your server implementation should check against the tz database,
                     * or have some special handling for zone and DST boundaries.
                     * 
                     * This is one of the MAJOR deficiencies in JavaScript's Date() implementation.  The other two are
                     * the lack of any sapient string formatting (which this plugin addresses), and the inability to
                     * do any real modification or comparison between dates (which this plugin kind-of-addresses.
                     * 
                     * If you want to denote that this input is displaying time adjusted for a specific zone, you can 
                     * put it in yourself as an escaped string "%H:%I %P %(DST)"
                     */
                    
                    
                    
                    /** TODO: use a regexp that matches everything nicely.
                     * matches %H tokens (strftime - replace and make interactive)
                     * matches !H tokens (strftime - replace but DON'T make interactive)
                     * matches %(something ) (special escape, everything between (...) is printed as is .. unnecessary?
                     */
                    var testre = /%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])|!([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])|%\((.*?)\)|(.+?)/g;
                    $.each(settings.format.match(testre),function(index,pre){
                        
                        // metachar
                        if(pre.match(/%%|%!/)) {
                            data.tokens.push({r:false,v:pre[1],i:false});
                        } else if(pre.match(/%([zZ])/)) {
                            // do nothing, see warning
                        }else if(pre.match(/%([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/)) {
                            data.tokens.push({r:true,v:pre[1],i:true});
                        }else if(pre.match(/!([aAbBCdegGHIjklmMpPsSuUVwWyYzZ%])/)) {
                            data.tokens.push({r:true,v:pre[1],i:false});
                        }else if(pre.match(/%\((.*?)\)/)) {
                            data.tokens.push( {r:false,v: pre.substring(2,-1), i:false} );
                        } else {
                            data.tokens.push({r:false,v:pre,i:false});
                        }
                    });
                    
                    if(currentSep.length) { data.tokens.push({r:false,v:currentSep}); currentSep=''; }
                } /* </ if( ! data ) >
                
                /* bind the elements to keypress */
                Self.bind('keydown.timeInput', methods.keydown);
                Self.bind('focus.timeInput', methods.focus);
                Self.bind('blur.timeInput', methods.blur);
                Self.bind('click.timeInput', methods.mouseclick);
                
                /* Update the input element */
                Self.timeInput("updateDisplay");
            });
        },
 
        /**
         * Updates the display.  Specifically, it renders the current value into
         * the HTML element's value attribute.
         */
        updateDisplay: function() {
            var Self = $(this),
                data = Self.data('timeInput');
            var oStr ='';
            $.each(data.tokens,function(index,val){
                oStr+=(val.r?utcdate("%"+val.v,data.ds,data.timezoneOffset).trim():val.v);
            });
            Self.val(oStr);
        },
 
        /**
         * Handle the element's keypress.
         */
        keydown: function(event) {
        
            var key = {left: 37, up: 38, right: 39, down: 40, tab:9, enter:13, backspace: 8 };
            var data = $(this).data('timeInput');
            switch(event.which) {
                case(key.left): 
                    if(selectPrevToken($(this)))
                        selectToken(data,data.currentToken);
                       
                    break;
                case(key.right): 
                    if(selectNextToken($(this))){
                        selectToken(data,data.currentToken);
                    } 
                    break;
                case(key.up): return incrementToken($(this)); break;
                case(key.down): return decrementToken($(this)); break;
                
                case(key.tab):
                    if (data.tabIncrementsSelection) {
                        if(event.shiftKey) {
                            if(selectPrevToken($(this))) {
                                event.preventDefault();
                                selectToken(data,data.currentToken);
                            }
                        } else {
                            if(selectNextToken($(this))) {
                                event.preventDefault();
                                selectToken(data,data.currentToken);
                            }
                        }
                    }
                    break;
                case(key.enter): 
                    
                    if(data.returnCompletesInput) {
                        var fc = $(":focusable");
                        var current = fc.index(data.element);
                        var next = fc.eq(current+1).length ? fc.eq(current+1) : fc.eq(0);
                        next.focus();
                    }
                    break;
                    
            }
        },
        focus: function(event) {
            
            var Self = $(this),
                data = Self.data('timeInput');
            data.currentToken = -1;
            selectRange(data.element,0,0);
            selectNextToken(Self);
            selectToken(data,data.currentToken);
        },
        blur: function(event) {
            
        },
        
        /**
         * Destroy and unbind the events
         */
        destroy: function() {
            return this.each(function(){
                var Self = $(this),
                    data = Self.data('timeInput');
                    
                Self.unbind('.timeInput');
                Self.removeData('timeInput');
            });
        },
        value: function() {
            var data = $(this).data('timeInput');
            return data.ds.getTime()-data.timezoneOffset;
        }
 
    }
    var publicMethods = [ 'keypress' ];
    
    
    /**
     *  Apply the plugin.
     */
    $.fn.timeInput = function( params ) {
        if( methods[params] && $.inArray(params, publicMethods) ){
            return methods[ params ].apply( this, Array.prototype.slice.call( arguments, 1));
        } else if ( typeof params  === 'object' || ! params ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( "Method " +  method + " does not exist on jQuery.timeInput" );
        } 
    }
})(jQuery)