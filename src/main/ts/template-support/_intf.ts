/**
 * comfortable
 *
 * Copyright (c) 2018 Kazuhiko Arase
 *
 * URL: https://github.com/kazuhikoarase/comfortable-js/
 *
 * Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 */

namespace comfortable {

  export interface TableTemplateCellStyle
  extends TableCellStyle, CellRendererFactoryOpts {

    width? : number;
    height? : number;

    columnDraggable? : boolean;
    columnResizable? : boolean;

    dataField? : string;

    /** one of 'string(default)', 'number', 'boolean', 'select-one' */
    dataType? : string;

    /** dataType : 'string', 'number' */
    maxLength? : number;

    /** dataType : 'number' */
    decimalDigits? : number;

    /** dataType : 'boolean',
      2 elements array like [falseValue, trueValue].
     */
    booleanValues? : any[];
    showGroupCheck? : boolean;

    /** dataType : 'select-one' */
    options? : (any[] | ((row : number, col : number) => any[]) );
    labelField? : string;
    valueField? : string;

    factory? : TableCellRendererFactory;

    label? : (string | ((model : TemplateTableModel) => string) );
    description? : (string | ((model : TemplateTableModel) => string) );
    /** dataType : 'number' */
    comparator? : Comparator;
  }

  export type Comparator = (v1 : any, v2 : any) => number;

  export interface TableTemplate {
    lockColumn? : number;
    columnDraggable? : boolean;
    thead? : TableTemplateCellStyle[][];
    tbody? : TableTemplateCellStyle[][];
    tfoot? : TableTemplateCellStyle[][];
  }

  export interface ItemIndex {
    row : number;
    /** col will be string if dataField is defined. */
    col : (number | string);
  }

  export interface TemplateTableModel extends TableModel {
    enableLockColumn : boolean;
    defaultLockColumn : number;
    setLockLeft : (lockLeft : number) => void;
    setLockRight : (lockLeft : number) => void;
    sort : Sort;
    filterFactory : (dataField : string) => Filter;
    getFilter : (dataField : string) => Filter;
    defaultHeaderCellRendererFactory : TableCellRendererFactory;
    headCells : { [ dataField : string ] : TableTemplateCellStyle };
    bodyCells : { [ dataField : string ] : TableTemplateCellStyle };
    footCells : { [ dataField : string ] : TableTemplateCellStyle };
    items : any[];
    filteredItems : any[];
    resetFilter : () => void;
    getItemAt : (row : number) => any;
    getItemCount : () => number;
    getItemIndexAt : (row : number, col : number) => ItemIndex;
    getItemStyleAt : (itemIndex : ItemIndex) => TableCellStyle;
    getOrderedColumnIndexAt : (col : number) => number;
    orderedColumnIndices : number[];
    hiddenColumns : { [ orderedCol : number ] : boolean };
    hoverRow : number;
    editingCell : { row : number, col : number };
    setTableState : (tableState : TemplateTableState) => void;
    getTableState : () => TemplateTableState;
    forEachItemCells : (
      callback: (
        cell : TableTemplateCellStyle,
        item : any, row : number, col : number) => boolean) => void;
  }

  export interface TemplateTableState {
    lockColumn : number;
    enableLockColumn : boolean;
    cellWidths : { col : number, width : number }[];
    cellHeights : { row : number, height : number }[];
    hiddenColumns : number[];
    sort : Sort;
    filters : { [ dataField : string ] : any };
    orderedColumnIndices : number[];
  }

  export interface TemplateTableCell extends TableCell {
    dataField? : string;
    comparator? : Comparator;
  }

  export interface FilterUI {
    $el : HTMLElement;
    setState : (state : any) => void;
    getState : () => any;
  }

  export interface Filter {
    createUI : (
      dialog : () => EventTarget,
      opts : FilterDialogOptions,
      tableModel : TemplateTableModel,
      cell : TemplateTableCell) => FilterUI;
    enabled : () => boolean;
    accept : (value : any) => boolean;
    setState : (state : any) => void;
    getState : () => any;
  }

  export interface Sort {
    dataField : string;
    order : string;
  }

  export interface TemplateTable extends Table {
  }

}
