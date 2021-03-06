"use strict";

var popClone = require("../pop-clone");

describe("clone", function () {

    var graph = {
        object: {a: 10},
        array: [1, 2, 3],
        string: "hello",
        number: 10,
        nestedObject: {
            a: {a1: 10, a2: 20},
            b: {b1: "a", b2: "c"}
        },
        nestedArray: [
            [1, 2, 3],
            [4, 5, 6]
        ],
        mixedObject: {
            array: [1, 3, 4],
            object: {a: 10, b: 20}
        },
        mixedArray: [
            [],
            {a: 10, b: 20}
        ],
        arrayWithHoles: [],
        clonable: Object.create({
            clone: function () {
                return this;
            }
        })
    }

    graph.cycle = graph;
    graph.arrayWithHoles[10] = 10;

    // Not reflexively equal, not equal to clone
    //graph.typedObject = Object.create(null);
    //graph.typedObject.a = 10;
    //graph.typedObject.b = 10;

    Object.forEach(graph, function (value, name) {
        it(name + " cloned equals self", function () {
            expect(popClone(value)).toEqual(value);
        });
    });

    it("should clone zero levels of depth", function () {
        var clone = popClone(graph, 0);
        expect(clone).toBe(graph);
    });

    it("should clone object at one level of depth", function () {
        var clone = popClone(graph, 1);
        expect(clone).toEqual(graph);
        expect(clone).not.toBe(graph);
    });

    it("should clone object at two levels of depth", function () {
        var clone = popClone(graph, 2);
        expect(clone).toEqual(graph);
        expect(clone.object).not.toBe(graph.object);
        expect(clone.object).toEqual(graph.object);
        expect(clone.nestedObject.a).toBe(graph.nestedObject.a);
    });

    it("should clone array at two levels of depth", function () {
        var clone = popClone(graph, 2);
        expect(clone).toEqual(graph);
    });

    it("should clone identical values at least once", function () {
        var clone = popClone(graph);
        expect(clone.cycle).not.toBe(graph.cycle);
    });

    it("should clone identical values only once", function () {
        var clone = popClone(graph);
        expect(clone.cycle).toBe(clone);
    });

    it("should clone clonable", function () {
        var clone = popClone(graph);
        expect(clone.clonable).toBe(graph.clonable);
    });

    it("should clone an object with a function property", function () {
        var original = {foo: function () {}};
        var clone = popClone(original);
        expect(clone.foo).toBe(original.foo);
        expect(Object.equals(clone, original)).toBe(true);
    });

    var object = {a: {a1: 10, a2: 20}, b: {b1: 10, b2: 20}};

    it("should clone zero levels", function () {
        expect(popClone(object, 0)).toBe(object);
    });

    it("should clone one level", function () {
        var clone = popClone(object, 1);
        expect(clone).toEqual(object);
        expect(clone).not.toBe(object);
        expect(clone.a).toBe(object.a);
    });

    it("should clone two levels", function () {
        var clone = popClone(object, 2);
        expect(clone).toEqual(object);
        expect(clone).not.toBe(object);
        expect(clone.a).not.toBe(object.a);
    });

    it("should clone with reference cycles", function () {
        var cycle = {};
        cycle.cycle = cycle;
        var clone = popClone(cycle);
        expect(clone).toEqual(cycle);
        expect(clone).not.toBe(cycle);
        expect(clone.cycle).toBe(clone);
    });

});

it("delegates to clone method, with less depth", function () {
    var object = {
        child: {
            clone: function (depth, memo) {
                expect(memo.has(object)).toBe(true);
                expect(depth).toBe(1);
                return "hello";
            }
        }
    };
    var cloned = popClone(object, 2);
    expect(cloned.child).toBe("hello");
});
