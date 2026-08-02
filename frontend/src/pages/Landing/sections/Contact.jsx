import { useState } from "react";
import { FiMail, FiMapPin, FiPhone, FiSend } from "react-icons/fi";
import SectionHeading from "../../../components/common/SectionHeading.jsx";
import Card from "../../../components/common/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Textarea from "../../../components/ui/Textarea.jsx";
import Button from "../../../components/ui/Button.jsx";
import api from "../../../services/api.js";
import { showToast } from "../../../components/common/Toast.jsx";
import { extractApiError } from "../../../services/apiMapper.js";
import { validateEmail, validateRequired } from "../../../utils/validators.js";

const contactChannels = [
  { icon: FiMail, label: "Email us", value: "hello@stockflow.app" },
  { icon: FiPhone, label: "Call us", value: "+91 98765 43210" },
  { icon: FiMapPin, label: "Visit us", value: "Bandra West, Mumbai, Maharashtra 400050" },
];

export default function Contact() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      name: validateRequired(values.name, "Name"),
      email: validateEmail(values.email),
      message: validateRequired(values.message, "Message"),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setLoading(true);
    try {
      const { data: response } = await api.post("/contact", values);
      showToast.success(response.message || "Message sent — we'll reply within 24 hours");
      setValues({ name: "", email: "", message: "" });
    } catch (error) {
      showToast.error(extractApiError(error, "Could not send your message. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Contact"
              title="Let's talk about your inventory"
              description="Questions about pricing, migrations, or integrations? Our team responds within one business day."
            />
            <div className="mt-10 space-y-4">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.label} className="flex items-center gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-secondary">
                      <Icon size={19} />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-muted">{channel.label}</p>
                      <p className="text-sm font-semibold text-white">{channel.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Your name"
                  placeholder="Jane Cooper"
                  value={values.name}
                  onChange={handleChange("name")}
                  error={errors.name}
                />
                <Input
                  label="Email address"
                  type="email"
                  placeholder="jane@company.com"
                  value={values.email}
                  onChange={handleChange("email")}
                  error={errors.email}
                />
              </div>
              <Textarea
                label="Message"
                placeholder="Tell us about your setup and what you're looking for..."
                rows={5}
                value={values.message}
                onChange={handleChange("message")}
                error={errors.message}
              />
              <Button type="submit" loading={loading} size="lg" rightIcon={FiSend} className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}
