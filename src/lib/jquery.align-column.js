/* Copyright (c) 2013-2020 NDP Software, Andrew J. Peterson
 * https://github.com/ndp/align-column
 */
$.fn.alignColumn = function (columns, options) {

    const config = $.extend({}, {
        addedCellClass: 'added',
        skipTHs: true
    }, options);

    if (!jQuery.isArray(columns)) {
        columns = [columns];
    }
    columns = columns.sort().reverse();
    if (config.debug) {
        console.log('Adjusting columns ', columns);
    }

    let splitter;
    if (typeof config.center == 'string') {
        if (config.debug) {
            console.log('Splitting by ', config.center);
        }
        splitter = function (text) {
            if (text === undefined) return '';
            const s = text.split(config.center);
            return (s.length === 2) ? [s[0], config.center + s[1]] : [text];
        }
    } else if (jQuery.isFunction(config.center)) {
        if (config.debug) {
            console.log('Splitting using fn');
        }
        splitter = config.center;
    } else {
        if (config.debug) {
            console.log('Splitting using decimal align');
        }
        splitter = function (text) {
            if (!text) return [''];
            let match;
            if (text.indexOf('.') === -1) {
                match = text.match(/^(\S+[\d]+)(.*)$/);
            } else {
                match = text.match(/^([^\.]+)(\..*)$/);
            }
            return match ? [match[1], match[2] || ''] : [text, ''];
        };
    }


    return $(this).each(function () {
        var $table = $(this).css('border-collapse', 'collapse'); // no way around this!
        var $rows = $table.find('tr');
        $rows.each(function () {
            const cells = $(this).find('>td,>th').not('.' + config.addedCellClass).get();
            for (let index = 0; index < columns.length; index++) {
                const colIndex = columns[index],
                    $cell = $(cells[colIndex]),
                    text = $cell.html(),
                    pieces = splitter(text),
                    existingClasses = $cell.attr('class');


                if (config.debug) {
                    console.log("Split '" + text + "' into " + pieces.length + " pieces: ", "" + pieces[0], "" + pieces[1]);
                }

                if (pieces.length === 2 &&
                    (!config.skipTHs || $cell.get(0).nodeName === 'TD')) {
                    if (' ' === pieces[0][pieces[0].length - 1]) {
                        pieces[0] = pieces[0].slice(0, pieces[0].length - 1) + '&nbsp;';
                    }

                    $cell.html(pieces[0]).css({width: '15%', textAlign: 'right', paddingRight: 0, borderRight: 'none'});
                    $('<td></td>').html(pieces[1]).css({
                        width: '15%',
                        textAlign: 'left',
                        paddingLeft: 0,
                        borderLeft: 'none'
                    }).addClass(config.addedCellClass).addClass(existingClasses).insertAfter($cell);
                } else {
                    $cell.attr('colspan', 2);
                }
            }
        });
    });
};

