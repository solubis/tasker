describe('pouchdb', function () {

  beforeEach(module('app.tasks'));

  it("should allow you to store and retrieve documents", inject(function (Database) {
        var retrieved,
            error,
            doc = {
              title: 'bar'
            };

        runs(function () {
          var db = new Database('test');

          db.create(doc)
              .then(function (result) {
                retrieved = result;
                return db.remove(retrieved);
              })
              .catch(function (e) {
                error = e;
                console.log(e);
              });
        });

        waitsFor(function () {
          return error || retrieved;
        }, "Waiting to complete", 1000);

        runs(function () {
          expect(error).toBeUndefined();
          expect(retrieved).not.toBeNull();
          expect(retrieved._id).toBeDefined();
          expect(retrieved.title).toBe('bar');
        });
      })
  );

  it("should populate with records", inject(function (TaskDatabase) {
        var error, tasks;

        runs(function () {
          var db = TaskDatabase;

          db.clean()
              .then(function () {
                return db.populate();
              })
              .then(function (result) {
                console.log(result);
                return db.all();
              })
              .then(function(result){
                console.log(result);
                tasks = result;
              })
              .catch(function (error) {
                console.log('Error (' + error.name + ') : ' + error.message);
                console.log(error.stack);
              });
        });

        waitsFor(function () {
          return error || tasks;
        }, "Waiting to complete", 1000);

        runs(function () {
          expect(error).toBeUndefined();
          expect(tasks).not.toBeNull();
          expect(tasks.length).toBeGreaterThan(0);
        });
      })
  );

});
