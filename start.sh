#!/bin/bash
# ============================================================================
# Yuki AI — Tüm Sistemi Başlat
#
# Bu script 3 servisi birden başlatır:
#   1. Bridge Service (port 3003) — WebSocket event hub
#   2. Next.js Panel (port 3000) — Yönetim arayüzü
#   3. (Opsiyonel) Python Backend — Gerçek TikTok + AI + TTS + OBS
#
# Kullanım:
#   ./start.sh              — Bridge + Next.js (simülasyon modu)
#   ./start.sh --full       — Bridge + Next.js + Python Backend (gerçek mod)
#   ./start.sh --stop       — Tüm servisleri durdur
#   ./start.sh --status     — Servis durumlarını göster
# ============================================================================

set -e

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PINK='\033[1;35m'
NC='\033[0m' # No Color

# Proje dizini (scriptin bulunduğu yer)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_DIR="$PROJECT_DIR/mini-services/tiktok-bridge"
BACKEND_DIR="$PROJECT_DIR/download/yuki-backend"
LOG_DIR="$PROJECT_DIR/logs"

mkdir -p "$LOG_DIR"

# PID dosyaları
PID_BRIDGE="$LOG_DIR/bridge.pid"
PID_NEXTJS="$LOG_DIR/nextjs.pid"
PID_PYTHON="$LOG_DIR/python.pid"

print_banner() {
    echo -e "${PINK}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║              雪  Yuki AI — Başlatılıyor                    ║"
    echo "║              Otonom TikTok Streamer Sistemi                ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_usage() {
    echo "Kullanım:"
    echo "  $0              Bridge + Next.js başlat (simülasyon modu)"
    echo "  $0 --full       Bridge + Next.js + Python Backend başlat (gerçek mod)"
    echo "  $0 --stop       Tüm servisleri durdur"
    echo "  $0 --status     Servis durumlarını göster"
    echo "  $0 --help       Bu yardım mesajını göster"
}

start_bridge() {
    if [ -f "$PID_BRIDGE" ] && kill -0 "$(cat $PID_BRIDGE)" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Bridge service zaten çalışıyor (PID: $(cat $PID_BRIDGE))${NC}"
        return 0
    fi

    echo -e "${BLUE}▶ Bridge service başlatılıyor (port 3003)...${NC}"
    cd "$BRIDGE_DIR"

    # Socket.io yüklü mü kontrol et
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   Bağımlılıklar yükleniyor...${NC}"
        bun install 2>&1 | tail -3
    fi

    nohup bun run dev > "$LOG_DIR/bridge.log" 2>&1 &
    echo $! > "$PID_BRIDGE"
    cd "$PROJECT_DIR"

    # Çalıştığını doğrula
    sleep 2
    if kill -0 "$(cat $PID_BRIDGE)" 2>/dev/null; then
        echo -e "${GREEN}✓ Bridge service çalışıyor (PID: $(cat $PID_BRIDGE))${NC}"
        echo -e "  Log: $LOG_DIR/bridge.log"
    else
        echo -e "${RED}✗ Bridge service başlatılamadı!${NC}"
        cat "$LOG_DIR/bridge.log" | tail -10
        return 1
    fi
}

start_nextjs() {
    if [ -f "$PID_NEXTJS" ] && kill -0 "$(cat $PID_NEXTJS)" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Next.js zaten çalışıyor (PID: $(cat $PID_NEXTJS))${NC}"
        return 0
    fi

    echo -e "${BLUE}▶ Next.js panel başlatılıyor (port 3000)...${NC}"
    cd "$PROJECT_DIR"

    # node_modules kontrol et
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}   Bağımlılıklar yükleniyor (bu birkaç dakika sürebilir)...${NC}"
        bun install 2>&1 | tail -3
    fi

    nohup bun run dev > "$LOG_DIR/nextjs.log" 2>&1 &
    echo $! > "$PID_NEXTJS"
    cd "$PROJECT_DIR"

    # Çalıştığını doğrula
    sleep 5
    if kill -0 "$(cat $PID_NEXTJS)" 2>/dev/null; then
        echo -e "${GREEN}✓ Next.js panel çalışıyor (PID: $(cat $PID_NEXTJS))${NC}"
        echo -e "  Log: $LOG_DIR/nextjs.log"
    else
        echo -e "${RED}✗ Next.js başlatılamadı!${NC}"
        cat "$LOG_DIR/nextjs.log" | tail -10
        return 1
    fi
}

start_python() {
    if [ ! -d "$BACKEND_DIR" ]; then
        echo -e "${YELLOW}⚠️  Python backend klasörü yok: $BACKEND_DIR${NC}"
        return 0
    fi

    if [ -f "$PID_PYTHON" ] && kill -0 "$(cat $PID_PYTHON)" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Python backend zaten çalışıyor (PID: $(cat $PID_PYTHON))${NC}"
        return 0
    fi

    echo -e "${BLUE}▶ Python backend başlatılıyor...${NC}"
    cd "$BACKEND_DIR"

    # Sanal ortam var mı kontrol et
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi

    # .env var mı kontrol et
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  .env dosyası yok — .env.example'ı kopyalayın:${NC}"
        echo -e "  cp .env.example .env"
        echo -e "  sonra .env dosyasını düzenleyin"
        cd "$PROJECT_DIR"
        return 1
    fi

    # Python var mı kontrol et
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}✗ Python3 bulunamadı!${NC}"
        cd "$PROJECT_DIR"
        return 1
    fi

    nohup python3 main.py > "$LOG_DIR/python.log" 2>&1 &
    echo $! > "$PID_PYTHON"
    cd "$PROJECT_DIR"

    sleep 3
    if kill -0 "$(cat $PID_PYTHON)" 2>/dev/null; then
        echo -e "${GREEN}✓ Python backend çalışıyor (PID: $(cat $PID_PYTHON))${NC}"
        echo -e "  Log: $LOG_DIR/python.log"
    else
        echo -e "${RED}✗ Python backend başlatılamadı!${NC}"
        cat "$LOG_DIR/python.log" | tail -10
        return 1
    fi
}

stop_all() {
    echo -e "${YELLOW}⏹ Tüm servisler durduruluyor...${NC}"

    for pid_file in "$PID_BRIDGE" "$PID_NEXTJS" "$PID_PYTHON"; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid"
                echo -e "  ${GREEN}✓ PID $pid durduruldu${NC}"
            fi
            rm -f "$pid_file"
        fi
    done

    # Temizlik: bun/node/next süreçlerini öldür
    pkill -f "bun.*tiktok-bridge" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "python.*main.py" 2>/dev/null || true

    echo -e "${GREEN}✓ Tamam${NC}"
}

show_status() {
    echo -e "${PINK}═══ Yuki AI — Servis Durumları ═══${NC}"
    echo

    # Bridge
    if [ -f "$PID_BRIDGE" ] && kill -0 "$(cat $PID_BRIDGE)" 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} Bridge Service  (PID: $(cat $PID_BRIDGE), port 3003)"
    else
        echo -e "  ${RED}○${NC} Bridge Service  — KAPALI"
    fi

    # Next.js
    if [ -f "$PID_NEXTJS" ] && kill -0 "$(cat $PID_NEXTJS)" 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} Next.js Panel   (PID: $(cat $PID_NEXTJS), port 3000)"
    else
        echo -e "  ${RED}○${NC} Next.js Panel   — KAPALI"
    fi

    # Python
    if [ -f "$PID_PYTHON" ] && kill -0 "$(cat $PID_PYTHON)" 2>/dev/null; then
        echo -e "  ${GREEN}●${NC} Python Backend (PID: $(cat $PID_PYTHON))"
    else
        echo -e "  ${YELLOW}○${NC} Python Backend — KAPALI (opsiyonel)"
    fi

    echo
    echo -e "  Log dosyaları: $LOG_DIR/"
    echo -e "  Web panel:    http://localhost:81 (Caddy gateway)"
    echo -e "                http://localhost:3000 (doğrudan Next.js)"
}

main() {
    print_banner

    case "${1:-start}" in
        start|"")
            start_bridge
            echo
            start_nextjs
            echo
            echo -e "${GREEN}════════════════════════════════════════════════${NC}"
            echo -e "${GREEN}  ✓ Sistem hazır!${NC}"
            echo -e "${GREEN}════════════════════════════════════════════════${NC}"
            echo
            echo -e "  ${PINK}Web Panel:${NC} http://localhost:81"
            echo
            echo -e "  ${YELLOW}Simülasyon modunda:${NC}"
            echo -e "    • 'Yayını Başlat'a bas → sahte TikTok yorumları gelmeye başlar"
            echo -e "    • 'Canlı Sohbet' sekmesi → AI cevaplarını onayla/reddet"
            echo -e "    • 'AI Kontrol' → otonomi modunu değiştir"
            echo
            echo -e "  ${YELLOW}Gerçek mod için:${NC}"
            echo -e "    • $0 --full   (Python backend de başlar)"
            echo -e "    • Önce .env dosyasını doldurun (download/yuki-backend/.env)"
            echo
            echo -e "  ${YELLOW}Durdurmak için:${NC} $0 --stop"
            ;;
        --full)
            start_bridge
            echo
            start_nextjs
            echo
            start_python
            echo
            echo -e "${GREEN}════════════════════════════════════════════════${NC}"
            echo -e "${GREEN}  ✓ Tam sistem hazır!${NC}"
            echo -e "${GREEN}════════════════════════════════════════════════${NC}"
            echo
            echo -e "  ${PINK}Web Panel:${NC} http://localhost:81"
            echo
            echo -e "  ${YELLOW}Sıradaki adımlar:${NC}"
            echo -e "    1. Web paneli aç"
            echo -e "    2. 'Ayarlar > TikTok Bağlantısı' → TikTok kullanıcı adını gir"
            echo -e "    3. 'AI Kontrol' → otonomi modunu seç (önce Manuel önerilir)"
            echo -e "    4. 'Yayını Başlat'a bas"
            echo -e "    5. OBS Studio'da TikTok RTMP yayınını başlat"
            echo
            echo -e "  ${YELLOW}Logları izle:${NC}"
            echo -e "    tail -f $LOG_DIR/bridge.log"
            echo -e "    tail -f $LOG_DIR/nextjs.log"
            echo -e "    tail -f $LOG_DIR/python.log"
            ;;
        --stop)
            stop_all
            ;;
        --status)
            show_status
            ;;
        --help|-h)
            print_usage
            ;;
        *)
            echo -e "${RED}Bilinmeyen komut: $1${NC}"
            print_usage
            exit 1
            ;;
    esac
}

main "$@"
