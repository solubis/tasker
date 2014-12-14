describe('pouchdb', function () {
  var Database, $rootScope, TaskDatabase;

  beforeEach(module('app.tasks'));
  beforeEach(inject(function (_$rootScope_, _Database_, $db) {
    Database = _Database_;
    $rootScope = _$rootScope_;
    TaskDatabase = $db;
  }));

  it("should allow you to store and retrieve documents", function (done) {
    var retrieved,
        error,
        db,
        doc = {
          title: 'bar'
        };

    new Database('test')
        .then(function (pouch) {
          db = pouch;
          return db.clean();
        })
        .then(function () {
          return db.create(doc)
        })
        .then(function (result) {
          retrieved = result;
          return db.remove(retrieved);
        })
        .catch(function (e) {
          error = e;
        })
        .finally(function () {
          done();

          expect(error).toBeUndefined();
          expect(retrieved).not.toBeNull();
          expect(retrieved._id).toBeDefined();
          expect(retrieved.title).toBe('bar');
        });
  });

  it("should populate with records", function (done) {
    var error, tasks, db;

    new TaskDatabase('tasks')
        .then(function (result) {
          db = result;
          return db.clean()
        })
        .then(function () {
          return db.populate();
        })
        .then(function (result) {
          tasks = result;
        })
        .catch(function (e) {
          error = e;
        })
        .finally(function () {
          done();

          expect(error).toBeUndefined();
          expect(tasks).toBeDefined();
          expect(tasks.length).toBeGreaterThan(0);
        });
  });

});
