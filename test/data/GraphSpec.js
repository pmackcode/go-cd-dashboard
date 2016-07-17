var should = require('chai').should(),
    Graph = require('../../src/data/Graph');

describe("Graph", function() {
    var graph;
    beforeEach(function() {
        graph = new Graph();
    });

    describe("getNodes", function() {
        it("should return empty list if there are no nodes", function() {
            graph.getNodes().should.be.empty;
        });

        it("should return list of node ids when there are some available", function() {
            graph.addNode("a", {}, []);
            graph.addNode("b", {}, []);

            graph.getNodes().should.deep.equal(["a", "b"])
        });
    });

    describe("getNode", function() {
        it("should return node with given id", function() {
            graph.addNode("id", {"name": "George", "age": 25}, ["another", "one-more"]);

            graph.getNode("id").should.deep.equal({
                "data": {"name": "George", "age": 25},
                "links": ["another", "one-more"]
            })
        });

        it("should return undefined for non existant id", function() {
            should.equal(graph.getNode("unknown"), undefined);
        });
    });

    describe("getLinks", function() {
        it("should return all ids of nodes that are linked to this node", function() {
            graph.addNode("a", {}, ["b", "c", "d"]);

            graph.getLinks("a").should.deep.equal(["b", "c", "d"])
        });

        it("should return empty list if node is not linked to any other node", function() {
            graph.addNode("b", {}, []);

            graph.getLinks("b").should.be.empty;
        });

        it("should return undefined if node id does not exist in graph", function() {
            should.equal(graph.getLinks("c"), undefined);
        });
    });

    describe("addNode", function() {
        it("should add node to graph with given id and data", function() {
            graph.addNode("a", {"some": "value"}, ["b", "c"]);

            graph.getNode("a").should.deep.equal({
                "data": {"some": "value"},
                "links": ["b", "c"]
            });
        });

        it("should update node if id already present in graph", function() {
            graph.addNode("a", {"some": "value"}, ["b", "c"]);
            graph.addNode("a", {"new": "updated-value"}, ["d", "e"]);

            graph.getNode("a").should.deep.equal({
                "data": {"new": "updated-value"},
                "links": ["d", "e"]
            });
        });

        it("should create empty nodes for links if not already specified", function() {
            graph.addNode("a", {"some": "value"}, ["b", "c"]);

            var nodes = graph.getNodes();
            nodes.should.have.lengthOf(3);
            nodes.should.have.members(["a", "b", "c"]);
            graph.getNode("b").should.deep.equal({
                data: {},
                links: []
            });
            graph.getNode("c").should.deep.equal({
                data: {},
                links: []
            });
        });

        it("should not update linked node if already exists", function() {
            graph.addNode("a", {"dont": "update"}, ["c"]);
            graph.addNode("b", {}, ["a"]);

            graph.getNode("a").should.deep.equal({
                data: {"dont": "update"},
                links: ["c"]
            });
        });

        it("should not update links if undefined", function() {
            graph.addNode("a", {"some": "value"}, ["b", "c"]);
            graph.addNode("a", {"new": "updated-value"});

            graph.getNode("a").should.deep.equal({
                "data": {"new": "updated-value"},
                "links": ["b", "c"]
            });
        });

        it("should create empty array links if creating node with links undefined", function() {
            graph.addNode("a", {"hello": "world"});
            graph.getNode("a").should.deep.equal({
                "data": {"hello": "world"},
                "links": []
            });
        });
    });

    describe("removeNode", function() {
        it("should remove node with given id", function() {
            graph.addNode("a", {}, []);
            graph.removeNode("a");

            should.equal(graph.getNode("a"), undefined);
        });

        it("should do nothing if id does not exist", function() {
            graph.addNode("a", {}, []);
            graph.removeNode("b");

            graph.getNodes().should.deep.equal(["a"]);
        });

        it("should remove all links to the removed node", function() {
            graph.addNode("a", {}, ["c"]);
            graph.addNode("b", {}, ["c"]);
            graph.removeNode("c");

            graph.getNodes().should.deep.equal(["a", "b"]);
            graph.getNode("a").should.deep.equal({
                data: {},
                links: []
            });

            graph.getNode("b").should.deep.equal({
                data: {},
                links: []
            });
        });
    });

    describe("breadthFirstSearch", function() {
        it("should return list of node ids in breadth first order from a given node", function() {
            graph.addNode("a", {}, ["b", "c"]);
            graph.addNode("b", {}, ["d", "e"]);
            graph.addNode("c", {}, ["f"]);
            graph.addNode("d", {}, ["f"]);
            graph.addNode("e", {}, ["f"]);
            graph.addNode("f", {}, ["g"]);
            graph.addNode("g", {}, []);

            graph.breadthFirstSearch("a").should.deep.equal(["a", "b", "c", "d", "e", "f", "g"]);
        });

        it("should return all nodes when the graph has multiple ends", function() {
            graph.addNode("a", {}, ["b", "c"]);
            graph.addNode("b", {}, ["d"]);
            graph.addNode("c", {}, ["e"]);
            graph.addNode("d", {}, ["f"]);
            graph.addNode("e", {}, ["g"]);
            graph.addNode("f", {}, []);
            graph.addNode("g", {}, []);

            graph.breadthFirstSearch("a").should.deep.equal(["a", "b", "c", "d", "e", "f", "g"]);
        });

        it("should return all nodes downstream of node when not searching from root", function() {
            graph.addNode("a", {}, ["b", "c"]);
            graph.addNode("b", {}, ["d"]);
            graph.addNode("c", {}, ["d"]);
            graph.addNode("d", {}, ["e"]);
            graph.addNode("e", {}, []);

            graph.breadthFirstSearch("a").should.deep.equal(["a", "b","c", "d", "e"]);
            graph.breadthFirstSearch("b").should.deep.equal(["b", "d", "e"]);
            graph.breadthFirstSearch("c").should.deep.equal(["c", "d", "e"]);
        });

        it("should visit links in alphabetical order", function() {
            graph.addNode("root", {}, ["b", "a"]);

            graph.breadthFirstSearch("root").should.deep.equal(["root", "a", "b"])
        });
    });

    describe("addLinks", function() {
        it("should update links on given node", function() {
            graph.addNode("a", {}, []);
            graph.addNode("b", {}, []);
            graph.addNode("c", {}, []);
            graph.addLinks("a", ["b", "c"]);

            graph.getLinks("a").should.deep.equal(["b", "c"]);
        });

        it("should do nothing if node does not exist", function() {
            graph.addLinks("made-up", ["a", "b"]);

            should.equal(graph.getNode("made-up"), undefined);
        });

        it("should not add link if already exists", function() {
            graph.addNode("b", {}, []);
            graph.addNode("a", {}, ["b"]);
            graph.addLinks("a", ["b"]);

            graph.getLinks("a").should.deep.equal(["b"]);
        });

        it("should create node if linking to node that does not exist", function() {
            graph.addNode("a", {}, []);
            graph.addLinks("a", ["b"]);

            graph.getNodes().should.deep.equal(["a", "b"]);
        });
    });

    describe("size", function() {
        it("should have size 0 when graph is empty", function() {
            graph.size().should.equal(0);
        });

        it("should return number of nodes in graph", function() {
            graph.addNode("a", {});
            graph.addNode("b", {});
            graph.addNode("c", {});
            graph.addNode("d", {});
            graph.addNode("e", {});

            graph.size().should.equal(5);
        });

        it("should return number of nodes after some additions and removals", function() {
            graph.addNode("a", {});
            graph.addNode("b", {});
            graph.addNode("c", {});
            graph.addNode("d", {});
            graph.addNode("e", {});

            graph.removeNode("b");
            graph.removeNode("e");

            graph.size().should.equal(3);
        });
    });
});