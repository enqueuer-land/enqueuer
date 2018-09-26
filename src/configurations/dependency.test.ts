import {Dependency} from "./dependency";
import {exec} from 'child_process';
jest.mock('child_process');


describe('Dependency', () => {
   it('Getters', () => {
       const packageName = 'package';
       const packageVersion = '1.0.0';
       const dependency = new Dependency(packageName, packageVersion);

       expect(dependency.getPackage()).toBe(packageName);
       expect(dependency.getVersion()).toBe(packageVersion);
   });

    it('Install error', done => {
        const packageName = 'package';
        const packageVersion = '1.0.0';
        const dependency = new Dependency(packageName, packageVersion);
        const error = 'error';

        exec.mockImplementationOnce((command, cb) => {
            expect(command).toBe('npm install package@1.0.0');
            cb(error);
        });


        dependency.install().catch((err) => {
            expect(err).toBe(error);
            done();
        })
    });

    it('Install success', done => {
        const packageName = 'package';
        const packageVersion = '1.0.0';
        const dependency = new Dependency(packageName, packageVersion);

        exec.mockImplementationOnce((command, cb) => {
            expect(command).toBe('npm install package@1.0.0');
            cb(null);
        });

        dependency.install().then(() => {
            done();
        })
    });

    it('Display', () => {
        const packageName = 'package';
        const packageVersion = '1.0.0';
        const dependency = new Dependency(packageName, packageVersion);
        expect(dependency.display()).toBe('package@1.0.0');
    });
});