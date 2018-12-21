//
// comfortable - DefaultCellRendererFactory
//
// Copyright (c) 2018 Kazuhiko Arase
//
// URL: https://github.com/kazuhikoarase/comfortable-js/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

namespace comfortable {

  'use strict';

  class TextEditor implements CellEditor {

    private opts : TextEditorOptions;
    private valueType : string;

    constructor(opts : TextEditorOptions) {
      this.opts = opts;
    }

    public $el = util.createElement('input', {
      attrs : { type : 'text', 'class' : '${prefix}-editor' }
    });

    private _$el = <HTMLInputElement>this.$el;

    public beginEdit(td : TdWrapper, cell : TextEditorCell) {
      var cs = window.getComputedStyle(td.$el, null);
      var opts : util.ElementOptions = {
          props : {},
          style : {
            textAlign : cs.textAlign,
            verticalAlign : cs.verticalAlign,
            color : cs.color,
            backgroundColor : cs.backgroundColor,
            fontFamily : cs.fontFamily,
            fontSize : cs.fontSize,
            fontWeight : cs.fontWeight
          }
        };
      if (typeof cell.maxLength == 'number') {
        (<any>opts.props).maxLength = cell.maxLength;
      }
      util.set(this.$el, opts);
    }
    public focus() {
      this.$el.focus();
      this._$el.select();
    }
    public blur() {
      this.$el.blur();
    }
    public setValue(value : any) {
      this._$el.value = value;
      this.valueType = typeof value;
    }
    public getValue() {
      if (this.opts.dataType == 'number') {
        var value = util.formatNumber(
            util.toNarrowNumber(this._$el.value),
            this.opts.decimalDigits, '');
        return this.valueType == 'number'? +value : value;
      }
      return this._$el.value;
    }
    public isValid() {
      if (this.opts.dataType == 'number') {
        return !!util.toNarrowNumber(
          <string>this.getValue() ).match(util.numRe);
      }
      return true;
    }
  }

  class CheckBox implements CellEditor {

    private opts : CheckBoxOptions;
    private booleanValues : any[] = null;

    constructor(opts : CheckBoxOptions) {
      this.opts = opts;
    }

    public $el = util.createElement('input', {
      attrs : { type : 'checkbox', 'class' : '${prefix}-editor' }
    });

    private _$el = <HTMLInputElement>this.$el;

    public beginEdit(td : TdWrapper, cell : CheckBoxCell) {
      var cs = window.getComputedStyle(td.$el, null);
      util.set(this.$el, {
        style : {
        }
      });
      this.booleanValues = cell.booleanValues || [false, true];
    }
    public focus() {
      this.$el.focus();
    }
    public blur() {
      this.$el.blur();
    }
    public setValue(value : any) {
      this._$el.checked = (value === this.booleanValues[1]);
    }
    public getValue() {
      return this.booleanValues[this._$el.checked? 1 : 0];
    }
    public isValid() {
      return true;
    }
  }

  class SelectBox implements CellEditor {

    private opts : SelectBoxOptions;

    constructor(opts : SelectBoxOptions) {
      this.opts = opts;
    }

    public $el = util.createElement('select', {
      attrs : { 'class' : '${prefix}-editor' }
    });

    private _$el = <HTMLSelectElement>this.$el;

    public beginEdit(td : TdWrapper, cell : SelectBoxCell) {
      var cs = window.getComputedStyle(td.$el, null);
      util.set(this.$el, {
        style : {
          textAlign : cs.textAlign,
          verticalAlign : cs.verticalAlign,
          color : cs.color,
          backgroundColor : cs.backgroundColor,
          fontFamily : cs.fontFamily,
          fontSize : cs.fontSize,
          fontWeight : cs.fontWeight
        }
      });
      var options = SelectBox.getOptions(cell);
      while (this.$el.childNodes.length < options.length) {
        this.$el.appendChild(util.createElement('option') );
      }
      var labelField = cell.labelField || 'label';
      var valueField = cell.valueField || 'value';
      var i = 0;
      for (; i < options.length; i += 1) {
        var option = options[i];
        util.set(this.$el.childNodes[i], {
          style : { display : '' },
          props : { textContent : option[labelField],
            value : option[valueField] }
        });
      }
      while (this.$el.childNodes.length > options.length) {
        this.$el.removeChild(this.$el.lastChild);
      }
      // IE9 does not support style.display=none.
      /*
      for (;i < select.childNodes.length; i += 1) {
        select.childNodes[i].style.display = 'none';
      }
      */
    }
    public focus() {
      this.$el.focus();
    }
    public blur() {
      this.$el.blur();
    }
    public setValue(value : any) {
      this._$el.value = value;
    }
    public getValue() {
      return this._$el.value;
    }
    public isValid() {
      return true;
    }

    public static getOptions(cell : SelectBoxCell) : any[] {
      var options : any = cell.options;
      if (typeof options == 'function') {
        options = options(cell.row, cell.col);
      }
      return options || [];
    }
  }

  export var createDefaultCellRendererFactoryOpts =
      function() : CellRendererFactoryOpts {
    return {
      // value to label
      labelFunction : function(value, cell) {

        if (typeof cell.labelFunction == 'function') {

          return cell.labelFunction(value);

        } else if (value === null || typeof value == 'undefined') {

          return '';

        } else if (this.dataType == 'number') {

          return util.formatNumber(value, this.decimalDigits);

        } else if (this.dataType == 'select-one') {

          var options = SelectBox.getOptions(cell);
          if (typeof options.splice != 'function') {
            // not an Array.
            return options[value] || '';
          }

          var labelField = (<SelectBoxCell>cell).labelField || 'label';
          var valueField = (<SelectBoxCell>cell).valueField || 'value';
          for (var i = 0; i < options.length; i += 1) {
            var option = options[i];
            if (option[valueField] == value) {
              return option[labelField];
            }
          }
          return '';
 
        } else {

          // by default, to string.
          return '' + value;

        }
      },
      // create a editor
      createEditor : function() {
        if (this.dataType == 'select-one') {
          return new SelectBox(this);
        } else if (this.dataType == 'boolean') {
          return new CheckBox(this);
        }
        return new TextEditor(this);
      }
    };
  };

  export var createDefaultCellRendererFactory =
      function(opts? : CellRendererFactoryOpts) :
        TableCellRendererFactory {

    opts = util.extend(createDefaultCellRendererFactoryOpts(), opts || {});

    return function(td : TdWrapper) : TableCellRenderer {

      var labelRenderer = createMultiLineLabelRenderer(td.$el);
      var editor : CellEditor = null;
      var oldValue : any = null;

      var beginEdit = function(cell : EditorCell) {
        if (editor == null) {
          editor = opts.createEditor();
          td.$el.appendChild(editor.$el);
        }
        labelRenderer.setVisible(false);
        editor.beginEdit(td, cell);
        editor.$el.style.display = '';
        editor.setValue(oldValue = cell.value);
      };

      var renderIsEditor = opts.renderIsEditor;
      if (typeof renderIsEditor == 'undefined') {
        renderIsEditor = opts.dataType == 'boolean' ||
          opts.dataType == 'select-one';
      }

      return {
        render : function(cell) {
          if (!renderIsEditor) {
            labelRenderer.setLabel(opts.labelFunction(cell.value, cell) );
            if (opts.dataType == 'number') {
              td.$el.style.textAlign = 'right';
            }
          } else {
            beginEdit(cell);
          }
        },
        beginEdit : function(cell) {
          beginEdit(cell);
          return {
            focus : function() {
              editor.focus();
            },
            endEdit : function() {
              if (!renderIsEditor) {
                labelRenderer.setVisible(true);
                editor.$el.style.display = 'none';
              } else {
                editor.blur();
              }
              return { oldValue : oldValue,
                newValue : editor.isValid()? editor.getValue() : oldValue };
            }
          };
        },
        dispose : function() {
        }
      };
    };
  };

  var linesRe = /\r?\n/g;

  export var createMultiLineLabelRenderer = function(parent : HTMLElement) {
    var elms : HTMLElement[] = null;
    return {
      setLabel : function(label : string) {
        if (elms == null) {
          elms = [ document.createElement('span') ];
          parent.appendChild(elms[0]);
        }
        var lines = label.split(linesRe);
        elms[0].textContent = lines[0];
        var elmIndex = 1;
        for (var i = 1; i < lines.length; i += 1) {
          if (elmIndex + 1 >= elms.length) {
            elms.push(document.createElement('br') );
            elms.push(document.createElement('span') );
            parent.appendChild(elms[elmIndex]);
            parent.appendChild(elms[elmIndex + 1]);
          }
          elms[elmIndex].style.display = '';
          elms[elmIndex + 1].style.display = '';
          elms[elmIndex + 1].textContent = lines[i];
          elmIndex += 2;
        }
        for (; elmIndex < elms.length; elmIndex += 1) {
          elms[elmIndex].style.display = 'none';
        }
      },
      setVisible : function(visible : boolean) {
        if (elms != null) {
          for (var i = 0; i < elms.length; i += 1) {
            elms[i].style.display = visible? '' : 'none';
          }
        }
      }
    };
  }

}