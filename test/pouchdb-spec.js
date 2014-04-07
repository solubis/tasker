describe('pouchdb', function () {

  beforeEach(module('app.tasks'));

  it("should clean database with Database.clean", inject(function ($rootScope, Database) {
        var done,
            error,
            db = null;

        new Database('test')
            .then(function (result) {
              db = result;
              db.clean();
            })
            .then(function () {
              done = true;
              console.log("Done...2");
            })
            .catch(function (e) {
              error = e;
            });

        waitsFor(function () {

          $rootScope.$digest();

          return error || done;
        }, "Waiting to complete", 2000);

        runs(function () {
          expect(error).toBeUndefined();
          expect(done).toBeDefined();
          expect(db).toNotBe(null);
        });
      })
  );


  it("should allow you to store and retrieve documents", inject(function ($rootScope, Database) {
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
            });

        waitsFor(function () {

          $rootScope.$digest();

          return error || retrieved;
        }, "Waiting to complete", 2000);

        runs(function () {
          expect(error).toBeUndefined();
          expect(retrieved).not.toBeNull();
          expect(retrieved._id).toBeDefined();
          expect(retrieved.title).toBe('bar');
        });
      })
  );

  it("should populate with records", inject(function ($rootScope, TaskDatabase) {
        var error, tasks, db;

        TaskDatabase
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
            });

        waitsFor(function () {

          $rootScope.$digest();

          return error || tasks;
        }, "Waiting to complete", 1000);

        runs(function () {
          expect(error).toBeUndefined();
          expect(tasks).toBeDefined();
          expect(tasks.length).toBeGreaterThan(0);
        });
      })
  );

});
