(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-voronoi-map')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-voronoi-map'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3));
}(this, function (exports,d3VoronoiMap) { 'use strict';

  function voronoiTreemap () {
    //begin: constants
    var DEFAULT_CONVERGENCE_RATIO = 0.01;
    var DEFAULT_MAX_ITERATION_COUNT = 50;
    var DEFAULT_MIN_WEIGHT_RATIO = 0.01;
    var DEFAULT_MAX_RECURSION_ITER = 5;
    //end: constants

    /////// Inputs ///////
    var clip = [[0,0], [0,1], [1,1], [1,0]]               // clipping polygon
    var convergenceRatio = DEFAULT_CONVERGENCE_RATIO;     // targeted allowed error ratio; default 0.01 stops computation when cell areas error <= 1% clipping polygon's area
    var maxIterationCount = DEFAULT_MAX_ITERATION_COUNT;  // maximum allowed iteration; stops computation even if convergence is not reached; use a large amount for a sole converge-based computation stop
    var minWeightRatio = DEFAULT_MIN_WEIGHT_RATIO;        // used to compute the minimum allowed weight; default 0.01 means 1% of max weight; handle near-zero weights, and leaves enought space for cell hovering

    var maxRecursionIter = DEFAULT_MAX_RECURSION_ITER;
    //begin: internals
    var _voronoiMap = d3VoronoiMap.voronoiMap();
    //end: internals

    ///////////////////////
    ///////// API /////////
    ///////////////////////

    function _voronoiTreemap (rootNode) {
      _voronoiMap.weight(function(d){ return d.value; })
        .convergenceRatio(convergenceRatio)
        .maxIterationCount(maxIterationCount)
        .minWeightRatio(minWeightRatio);

      // Reutrns highst node with all children
      return recurse(clip, rootNode);
    };

    _voronoiTreemap.convergenceRatio = function (_) {
      if (!arguments.length) { return convergenceRatio; }

      convergenceRatio = _;
      return _voronoiTreemap;
    };

    _voronoiTreemap.maxIterationCount = function (_) {
      if (!arguments.length) { return maxIterationCount; }

      maxIterationCount = _;
      return _voronoiTreemap;
    };

    _voronoiTreemap.minWeightRatio = function (_) {
      if (!arguments.length) { return minWeightRatio; }

      minWeightRatio = _;
      return _voronoiTreemap;
    };

    _voronoiTreemap.clip = function (_) {
      if (!arguments.length) { return _voronoiMap.clip(); }

      _voronoiMap.clip(_);
      clip = _voronoiMap.clip();
      return _voronoiTreemap;
    };

    _voronoiTreemap.maxRecursionIter = function (_) {
      if (!arguments.length) { return maxRecursionIter; }

      maxRecursionIter = _;
      return _voronoiTreemap;
    };
    ///////////////////////
    /////// Private ///////
    ///////////////////////

    function recurse(clippingPolygon, node, iter = 0) {
      var voronoiMapRes;
      var originalData = [];
      var end = false;

      //assign polygon to node
      node.polygon = clippingPolygon;
      if(maxRecursionIter && iter >= maxRecursionIter) {
        end = true;
      } else {
        iter = iter + 1;
      }

      if (node.height!=0 && !end) {
        //compute one-level Voronoi map of children
        voronoiMapRes = _voronoiMap.clip(clippingPolygon)(node.children ? node.children : node);

        //get original dat from current nodes
        voronoiMapRes.polygons.forEach(polygon => originalData.push(polygon.site.originalObject.data.originalData));

        //begin: recurse on children
        voronoiMapRes.polygons.forEach(function(cp){
          recurse(cp, cp.site.originalObject.data.originalData, iter);
        })
        //end: recurse on children
      }

      return originalData;
    };

    return _voronoiTreemap;
  }

  exports.voronoiTreemap = voronoiTreemap;

  Object.defineProperty(exports, '__esModule', { value: true });

}));