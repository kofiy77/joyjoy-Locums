import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy, Facebook, Twitter, Mail, Linkedin } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

interface ShareWithFriendsProps {
  isOpen: boolean;
  onClose: () => void;
  userFirstName?: string;
}

export default function ShareWithFriends({ isOpen, onClose, userFirstName = 'Friend' }: ShareWithFriendsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Generate referral link with user's name
  const referralLink = `https://joyjoycare.co.uk/register?ref=${userFirstName?.toLowerCase().replace(' ', '')}`;
  
  const shareMessage = `Introduce a friend to JoyJoy Care and you both get £30* voucher when they work their first shift.`;
  const socialMessage = `${shareMessage} Join me on JoyJoy Care: ${referralLink}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "The referral link has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the link",
        variant: "destructive",
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    let url = '';
    const encodedMessage = encodeURIComponent(socialMessage);
    const encodedLink = encodeURIComponent(referralLink);
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedMessage}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedMessage}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent('Join JoyJoy Care - Care Staffing Platform')}&body=${encodedMessage}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold text-gray-900">
            Why keep a good thing to yourself?
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              {shareMessage}
            </p>
            <p className="text-sm font-medium text-gray-900 mb-6">
              Share this link regularly with your friends
            </p>
          </div>

          {/* Referral Link Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="flex-1 bg-gray-50 text-sm"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                onClick={copyToClipboard}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-3">
            <p className="text-center text-sm font-medium text-gray-700">
              Or through your favourite social channel
            </p>
            
            <div className="grid grid-cols-5 gap-2">
              {/* Facebook */}
              <Button
                onClick={() => shareOnSocial('facebook')}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white p-0"
              >
                <Facebook className="h-6 w-6" />
              </Button>
              
              {/* Twitter */}
              <Button
                onClick={() => shareOnSocial('twitter')}
                className="h-12 bg-sky-500 hover:bg-sky-600 text-white p-0"
              >
                <Twitter className="h-6 w-6" />
              </Button>
              
              {/* Email */}
              <Button
                onClick={() => shareOnSocial('email')}
                className="h-12 bg-gray-700 hover:bg-gray-800 text-white p-0"
              >
                <Mail className="h-6 w-6" />
              </Button>
              
              {/* LinkedIn */}
              <Button
                onClick={() => shareOnSocial('linkedin')}
                className="h-12 bg-blue-700 hover:bg-blue-800 text-white p-0"
              >
                <Linkedin className="h-6 w-6" />
              </Button>
              
              {/* WhatsApp */}
              <Button
                onClick={() => shareOnSocial('whatsapp')}
                className="h-12 bg-green-500 hover:bg-green-600 text-white p-0"
              >
                <FaWhatsapp className="h-6 w-6" />
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              * Terms & Conditions apply
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-8"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}