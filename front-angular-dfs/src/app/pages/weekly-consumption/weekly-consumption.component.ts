import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { Jwt } from 'src/app/models/Jwt';
import { AuthService } from 'src/app/services/auth.service';
import { getUserIdFromLocalStorage } from 'src/app/utils/auth.helper';
import { ExtendedChartDataset } from 'src/app/utils/chart-extensions';

interface WeeklyConsumptionData {
  total_calories: number;
  total_lipids: number;
  total_carbohydrates: number;
  total_proteins: number;
  date: string;
  type: string;
}

@Component({
  selector: 'app-weekly-consumption',
  templateUrl: './weekly-consumption.component.html',
  styleUrls: ['./weekly-consumption.component.scss'],
})
export class WeeklyConsumptionComponent implements OnInit {
  jwt: Jwt | null = null;

  constructor(private http: HttpClient, private auth: AuthService) {
    this.auth.$jwt.subscribe((jwt) => (this.jwt = jwt));
  }

  ngOnInit(): void {
    this.fetchWeeklyData();
  }

  fetchWeeklyData(): void {
    // Make the HTTP request to fetch the weekly consumption data
    const userId = getUserIdFromLocalStorage();
    this.http
      .get<WeeklyConsumptionData[]>(
        `http://localhost:3000/weekly-consumption?user_id=${userId}`
      )
      .subscribe((data: WeeklyConsumptionData[]) => {
        // Sort the data by date in ascending order
        data.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
  
        // Extract the unique dates and types of meals
        const uniqueDates = [...new Set(data.map((entry) => entry.date))];
        const uniqueMealTypes = [...new Set(data.map((entry) => entry.type))];
  
        // Prepare the datasets
        const datasets = uniqueMealTypes.map((mealType) => {
          const filteredData = data.filter((entry) => entry.type === mealType);
  
          const dataset = {
            label: mealType,
            data: filteredData.map((entry) => entry.total_calories),
            calories: filteredData.map((entry) => entry.total_calories),
            lipids: filteredData.map((entry) => entry.total_lipids),
            carbohydrates: filteredData.map((entry) => entry.total_carbohydrates),
            proteins: filteredData.map((entry) => entry.total_proteins),
            backgroundColor: this.getColorByMealType(mealType),
            borderColor: this.getColorByMealType(mealType),
            borderWidth: 1,
          };
  
          return dataset;
        });
  
        // Generate the chart
        const ctx = document.getElementById('myChart') as HTMLCanvasElement;
        const myChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: uniqueDates.map((date) => this.formatDate(date)),
            datasets: datasets,
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || '';
                    const dataIndex = context.dataIndex;
                    const dataset = context.dataset as unknown as ExtendedChartDataset;
                    const calories = dataset.calories[dataIndex];
                    const lipids = dataset.lipids[dataIndex];
                    const carbohydrates = dataset.carbohydrates[dataIndex];
                    const proteins = dataset.proteins[dataIndex];
                    return `${label}: ${calories} Calories, Lipides: ${lipids}g, Glucides: ${carbohydrates}g, Protéines: ${proteins}g`;
                  },
                },
              },
            },
          },
        });
      });
  }
  

  formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', options);
  }

  getColorByMealType(mealType: string): string {
    switch (mealType) {
      case 'Petit déjeuner':
        return 'rgba(75, 192, 192, 0.2)';
      case 'Repas de midi':
        return 'rgba(192, 75, 75, 0.2)';
      case 'Encas':
        return 'rgba(192, 192, 75, 0.2)';
      case 'Repas du soir':
        return 'rgba(75, 75, 192, 0.2)';
      default:
        return 'rgba(0, 0, 0, 0.2)';
    }
  }

  closeAlert() {
    const alertContainer = document.getElementById('alertContainer') as HTMLElement;
    if (alertContainer) {
      alertContainer.style.display = 'none';
    }
  }

}

