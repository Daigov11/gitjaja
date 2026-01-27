/* ===== TOP-LEVEL VARS (sin const/let) ===== */
var HELP_IMG_URL, WHATSAPP_PHONE, WHATSAPP_TEXT;

HELP_IMG_URL = "http://api-centralizador.apiworking.pe/images/73456618-7161-440a-8903-3ed53667c759.png";
WHATSAPP_PHONE = "51946762926"; // 51 + 946762926
WHATSAPP_TEXT = "Hola, necesito ayuda con mi pedido.";

export default function HelpWhatsappFloat(props) {
  var phone, text, imgUrl, href;

  phone = (props && props.phone) ? props.phone : WHATSAPP_PHONE;
  text = (props && props.text) ? props.text : WHATSAPP_TEXT;
  imgUrl = (props && props.imgUrl) ? props.imgUrl : HELP_IMG_URL;

  href = "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Necesitas ayuda por WhatsApp"
      title="¿Necesitas ayuda?"
      className="fixed bottom-4 right-4 z-[9999] block"
    >
      <img
        src={imgUrl}
        alt="¿Necesitas ayuda?"
        className="h-40 w-40 select-none drop-shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-transform"
        draggable="false"
      />
    </a>
  );
}
