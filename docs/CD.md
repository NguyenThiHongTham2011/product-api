# Hoan thien Prompt 1: buoc 12-14

Trang thai: da chuan bi file, chua publish va chua xac nhan trien khai.

1. Chep cac file trong thu muc nay vao D:\LTHDV\PROMPT 1\product-api, giu dung cau truc thu muc.
2. Docker Hub: tao repository public nguyenthihongtham2011/product-api neu chua co.
3. Tu tao Docker Hub Personal Access Token quyen Read & Write. Khong gui token trong chat, khong luu vao ma nguon.
4. GitHub repository > Settings > Secrets and variables > Actions > New repository secret. Ten DOCKERHUB_TOKEN, gia tri la token vua tao.
5. Commit va push cac file len main. Theo doi workflow Product API Docker CI. Chi sau khi healthcheck, CRUD, MongoDB va restart test thanh cong thi image da test moi duoc push. Pull request khong push image.
6. Tao .env.docker tu file mau neu chua co. Giu ten database dang dung neu muon tiep tuc du lieu cu.
7. Mo Git Bash/PowerShell trong VS Code tai thu muc du an. Docker Desktop phai dang chay.
8. Chay: powershell -File .\scripts\deploy-local.ps1
9. De tu dong kiem tra image moi moi 5 phut: powershell -File .\scripts\deploy-local.ps1 -Watch

Script -Watch phai tiep tuc chay; dong terminal hoac tat may se dung theo doi. Day chua phai Windows service. Sau khoi dong lai may can chay lai script. Container da tao co restart unless-stopped.

Neu container nammongodb/product-api dang thuoc Compose project khac, can xac minh project cu truoc khi chuyen. Khong xoa volume nammongodb_data. Script khong tu dong xoa container cu de tranh mat du lieu.

Kiem tra thanh cong: workflow xanh, Docker Hub co tag latest va sha-<commit>, local /health tra status healthy va database connected. Chua duoc coi la hoan thanh den khi cac buoc nay duoc xac nhan.

Rollback: dat bien IMAGE_TAG=sha-<commit-cu> roi chay deploy-local.ps1. Tag sha duoc tao moi lan push thanh cong.
