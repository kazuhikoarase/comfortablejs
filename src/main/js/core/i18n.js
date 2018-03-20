//
// comfortable - i18n
//
// Copyright (c) 2017 Kazuhiko Arase
//
// URL: https://github.com/kazuhikoarase/comfortable/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//

!function($c) {

  'use strict';

  var getInstance = function(lang) {
    lang = lang || navigator.language || navigator.userLanguage;
    return $c.util.extend({}, $c.i18n.en, $c.i18n[lang] ||
        $c.i18n[lang.replace(/\-\w+$/, '')] || {});
  };

  var getMessages = function() {
    return this.getInstance().messages;
  };

  $c.i18n = $c.i18n || {};
  $c.i18n.getInstance = getInstance;
  $c.i18n.getMessages = getMessages;

}(window.comfortable || (window.comfortable = {}) );