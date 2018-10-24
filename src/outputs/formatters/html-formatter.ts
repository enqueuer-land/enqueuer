import {Formatter} from './formatter';
import {RequisitionModel} from '../../models/outputs/requisition-model';
import {Injectable} from 'conditional-injector';
import {StringRandomCreator} from '../../strings/string-random-creator';
import {Test, TestsAnalyzer} from '../tests-analyzer';
import {PublisherModel} from '../../models/outputs/publisher-model';
import {Json} from '../../object-notations/json';
import {SubscriptionModel} from '../../models/outputs/subscription-model';
import {bool} from 'aws-sdk/clients/signer';

//TODO test it
@Injectable({predicate: (output: any) => output.format && output.format.toLowerCase() === 'html'})
export class JsonFormatter extends Formatter {

    public format(report: RequisitionModel): string {
        const body = this.createRequisitionCard(report);
        return this.createFullHtml(body);
    }

    private createRequisitionCard(requisitionModel: RequisitionModel): string {
        const parentId = 'id' + new StringRandomCreator().create(10);

        let accordionCards = this.createTestAccordionCard(requisitionModel, parentId);

        if (requisitionModel.publishers && requisitionModel.publishers.length > 0) {
            const innerId = 'id' + new StringRandomCreator().create(10);
            const parentId = 'id' + new StringRandomCreator().create(10);
            const inner = requisitionModel.publishers
                .map(publisher => this.createAccordionCard(innerId, publisher.name, this.createPublisherCard(publisher))).join('');
            const publishers = this.createAccordion(parentId, this.createAccordionCard(innerId, 'Publishers', inner));
            accordionCards += this.createAccordion(parentId, publishers);
        }

        if (requisitionModel.subscriptions && requisitionModel.subscriptions.length > 0) {
            const innerId = 'id' + new StringRandomCreator().create(10);
            const parentId = 'id' + new StringRandomCreator().create(10);
            const inner = requisitionModel.subscriptions
                .map(subscription => this.createAccordionCard(innerId, subscription.name, this.createSubscriptionCard(subscription))).join('');
            const subscriptions = this.createAccordion(parentId, this.createAccordionCard(innerId, 'Subscriptions', inner));
            accordionCards += this.createAccordion(parentId, subscriptions);
        }

        if (requisitionModel.requisitions && requisitionModel.requisitions.length > 0) {
            const innerId = 'id' + new StringRandomCreator().create(10);
            const parentId = 'id' + new StringRandomCreator().create(10);
            const inner = requisitionModel.requisitions
                .map(requisition => this.createAccordionCard(innerId, requisition.name, this.createRequisitionCard(requisition))).join('');
            const requisitions = this.createAccordion(parentId, this.createAccordionCard(innerId, 'Requisitions', inner));
            accordionCards += this.createAccordion(parentId, requisitions);
        }

        return this.createAccordion(parentId, accordionCards);
    }

    private createPublisherCard(publisherReport: PublisherModel): string {
        const parentId = 'id' + new StringRandomCreator().create(10);

        let body = this.createTestAccordionCard(publisherReport, parentId);
        if (publisherReport.messageReceived) {
            body += this.createAccordionCard(parentId, 'Message received',
                `<pre><code class="text-white">${new Json().stringify(publisherReport.messageReceived)}</code></pre>`);
        }
        return this.createAccordion(parentId, body);
    }

    private createSubscriptionCard(subscriptionReport: SubscriptionModel): string {
        const parentId = 'id' + new StringRandomCreator().create(10);
        let body = this.createTestAccordionCard(subscriptionReport, parentId);
        if (subscriptionReport.messageReceived) {
            body += this.createAccordionCard(parentId, 'Message received',
                `<pre><code>${new Json().stringify(subscriptionReport.messageReceived)}</code></pre>`);
        }
        return this.createAccordion(parentId, body);
    }

    private createTestAccordionCard(report: any, parentId: string) {
        const testAnalyzer = new TestsAnalyzer(report);
        const testsNumber = testAnalyzer.getTests().length;

        if (testsNumber > 0) {
            const percentage = testAnalyzer.getPercentage();
            let title = `${testAnalyzer.getPassingTests().length}/${testsNumber} (${percentage}%)`;
            if (report.time) {
                const totalTime = report.time.totalTime;
                title += ` ${totalTime}ms`;
            }

            return this.createAccordionCard(parentId, 'Tests', this.createTestTable(title, testAnalyzer.getTests()));
        }
        return '';
    }

    private createAccordion(parentId: string, accordionCards: string, show: bool = false): string {
        return `<div class="accordion ${show ? 'show' : ''}" id="${parentId}  mb-1">
                    ${accordionCards}
                 </div>`;
    }

    private createAccordionCard(parentId: string, title: string, body: string) {
        const collapsibleId = 'id' + new StringRandomCreator().create(10);
        return `<div class="card bg-dark mb-0">
                    <div class="card-header" id="${parentId}">
                      <h6 class="mb-0">
                        <button class="btn btn-link text-white " type="button" data-toggle="collapse" data-target="#${collapsibleId}">
                          ${title}
                        </button>
                      </h6>
                    </div>
                    <div id="${collapsibleId}" class="collapse" data-parent="#${parentId}">
                      <div class="card-body bg-light">
                        ${body}
                      </div>
                    </div>
                </div>`;
    }

    private createTestTable(title: string, tests: Test[]): string {
        return `<h6 class="${tests.every(test => test.test.valid) ? 'text-success' : 'text-danger'} text-right" >${title}</h6>
                <table class="table table-sm table-striped table-hover table-dark">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Hierarchy</th>
                      <th scope="col">Name</th>
                      <th scope="col">Description</th>
                      <th scope="col">Valid</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tests.map((test: Test, index: number) => {
                        return `<tr>
                                  <th scope="row">${index + 1}</th>
                                  <td>${test.hierarchy.join(' › ')}</td>
                                  <td>${test.test.name}</td>
                                  <td>${test.test.description}</td>
                                  <td class="${test.test.valid ? 'bg-success' : 'bg-danger'} text-center" >${test.test.valid}</td>
                                </tr>`;
                    }).join('')}
                  </tbody>
                </table>`;
    }

    private createFullHtml(body: string): string {
        return `<!doctype html>
                <html lang="en">
                  <head>
                    <!-- Required meta tags -->
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                    <!-- Bootstrap CSS -->
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
                        integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
                    <title>Enqueuer Rocks</title>
                  </head>
                  <body>
                    <div class="container-fluid">
                        <div class="text-center">
                            <img src="../docs/images/fullLogo1.png">
                        </div>
                        ${body}
                    </div>
                    <!-- Optional JavaScript -->
                    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
                    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js"
                        integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"
                        integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
                    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js"
                        integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
                  </body>
                </html>`;
    }
}
