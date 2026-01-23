## CI/CD Pipeline

Proyek ini menerapkan CI/CD menggunakan GitHub Actions.

### Continuous Integration (CI)

CI dijalankan setiap ada Pull Request ke branch `master`.  
Pipeline ini melakukan:

- Install dependency
- Menjalankan database migration pada database testing
- Menjalankan seluruh unit test

CI memastikan setiap perubahan kode telah lolos pengujian sebelum digabungkan ke branch utama.

### Continuous Deployment (CD)

Continuous Deployment dijalankan otomatis setiap ada perubahan pada branch `master`.  
Pipeline CD akan:

- Menghubungkan GitHub Actions ke server EC2 menggunakan SSH
- Mengambil perubahan terbaru dari repository
- Menginstall dependency production
- Menjalankan database migration
- Me-restart aplikasi menggunakan PM2

Dengan konfigurasi ini, setiap perubahan pada branch `master` akan langsung ter-deploy ke server production.
