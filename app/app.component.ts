import { Component } from '@angular/core';
import { differenceInMinutes } from 'date-fns';
import { groupBy, map, mapValues, sortBy, sum, sumBy, values } from 'lodash';

const employeeDataUrl = 'https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ=='

type EmployeeTimeLog = {
  Id: string,
  EmployeeName: string,
  StarTimeUtc: string,
  EndTimeUtc: string,
  EntryNotes: string
}

type EmployeeWorkHour = {
  name: string,
  totalWorkHours: number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'task-a';



  ////////// TASK A Code//////////
  loadEmployeeTotalTime = (): Promise<EmployeeWorkHour[]> => {
    return fetch(employeeDataUrl)
      .then(response => response.json() as Promise<EmployeeTimeLog[]>)
      .then(employeeLogs => {
        const workHoursForEmployees = employeeLogs
          .map(({EmployeeName, StarTimeUtc, EndTimeUtc}) => ({
            EmployeeName,
            durationInhours: differenceInMinutes(new Date(EndTimeUtc), new Date(StarTimeUtc)) / 60
          }));

        return sortBy(values(mapValues(groupBy(workHoursForEmployees, 'EmployeeName'), (durations, name) => ({
          name,
          totalWorkHours: sum(map(durations, 'durationInhours'))
        }))), 'totalWorkHours')
      });
  }
////////// TASK B Code//////////
  public chartData: any;

  public employeeWorkHours: EmployeeWorkHour[] = [];

  constructor() {
    this.loadEmployeeTotalTime()
      .then(value => this.employeeWorkHours = value)
      .then(() => {
        const aggHours = sumBy(this.employeeWorkHours, 'totalWorkHours')
        this.chartData = {
          labels: map(this.employeeWorkHours, 'name'),
          datasets: [{
            data: map(this.employeeWorkHours, ({totalWorkHours}) => totalWorkHours / aggHours * 100)
          }]
        }
      });
  }

}
