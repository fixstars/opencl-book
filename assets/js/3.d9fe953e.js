(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{451:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.06.50_PM.cd97ff44.png"},452:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.09.16_PM.33425403.png"},453:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.09.59_PM.ba3b7776.png"},454:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.10.36_PM.a5a7720e.png"},455:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.11.22_PM.27dcdd3e.png"},456:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.13.46_PM.3256ddec.png"},457:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.14.29_PM.b3ff06f3.png"},458:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.15.04_PM.eecf0bc1.png"},459:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.15.57_PM.ee4e6b59.png"},460:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.24.44_PM.9a880ddc.png"},461:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.42.38_PM.76815c9a.png"},462:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.44.15_PM.64e9a84f.png"},463:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_9.45.09_PM.cc778751.png"},464:function(e,t,o){e.exports=o.p+"assets/img/Screen_Shot_2022-01-02_at_10.09.47_PM.573f1cad.png"},502:function(e,t,o){"use strict";o.r(t);var n=o(56),s=Object(n.a)({},(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[n("h1",{attrs:{id:"development-environment-setup"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#development-environment-setup"}},[e._v("#")]),e._v(" Development Environment Setup")]),e._v(" "),n("h2",{attrs:{id:"intel-opencl-setup"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#intel-opencl-setup"}},[e._v("#")]),e._v(" "),n("em",[e._v("Intel OpenCL Setup")])]),e._v(" "),n("p",[e._v("In this section, we will walkthrough the process of installing Intel OpenCL SDK on Windows and Linux. The installation steps can also be found on their website: "),n("a",{attrs:{href:"http://software.intel.com/en-us/articles/installation-notes-opencl-sdk",target:"_blank",rel:"noopener noreferrer"}},[e._v("http://software.intel.com/en-us/articles/installation-notes-opencl-sdk"),n("OutboundLink")],1)]),e._v(" "),n("p",[n("strong",[e._v("For Windows")])]),e._v(" "),n("p",[e._v("To install the Intel OpenCL SDK on Windows, first download the executable from their website. Note that both 32-bit and 64-bit exist, and the version should be chosen accordingly.")]),e._v(" "),n("p",[n("a",{attrs:{href:"http://software.intel.com/en-us/articles/installation-notes-opencl-sdk",target:"_blank",rel:"noopener noreferrer"}},[e._v("http://software.intel.com/en-us/articles/installation-notes-opencl-sdk"),n("OutboundLink")],1)]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.1: Intel OpenCL SDK download screen")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(451),alt:""}})]),e._v(" "),n("p",[e._v("Unless there are special requirements, the installation should be performed using the default values.")]),e._v(" "),n("p",[n("strong",[e._v("For Linux")])]),e._v(" "),n("p",[e._v("The installation executable is packaged as a RPM file for Red Hat distribution. The RPM can be downloaded from the same URL as above. Extract the downloaded file and install the RPM as root.")]),e._v(" "),n("p",[n("strong",[e._v("Example for Intel OpenCL SDK 1.5")])]),e._v(" "),n("blockquote",[n("p",[e._v("# tar xzf intel_ocl_sdk_1.5_x64.tgz")]),e._v(" "),n("p",[e._v("# rpm -i intel_ocl_sdk_1.5_x64.rpm")])]),e._v(" "),n("p",[e._v("We have also verified the installation procedure could be performed successfully on Fedora 16 Desktop (64-bit).")]),e._v(" "),n("h2",{attrs:{id:"apple-opencl-setup"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#apple-opencl-setup"}},[e._v("#")]),e._v(" "),n("em",[e._v("Apple OpenCL Setup")])]),e._v(" "),n("p",[e._v('OpenCL is included by default on Mac OS X 10.6 and later, but requires Apple\'s IDE "Xcode" for development. The Xcode setup procedure varies depending on the version of the Mac OS X. Here, we will walk through the installation of Xcode for Lion and Snow Leopard')]),e._v(" "),n("p",[n("strong",[e._v("For Lion")])]),e._v(" "),n("p",[e._v('The version of Xcode that can be used on Lion is "Xcode 4". The installation can be done in 1 of the 2 following ways:')]),e._v(" "),n("p",[e._v("1) From the AppStore ("),n("strong",[e._v("Figure 3.2")]),e._v(")")]),e._v(" "),n("p",[e._v("2) From Apple's Xcode site "),n("a",{attrs:{href:"http://developer.apple.com/xcode/",target:"_blank",rel:"noopener noreferrer"}},[e._v("http://developer.apple.com/xcode/"),n("OutboundLink")],1)]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.2: Xcode download screen on the AppStore")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(452),alt:""}})]),e._v(" "),n("p",[n("strong",[e._v("For Snow Leopard")])]),e._v(" "),n("p",[e._v('The Xcode cannot be installed from the AppStore on Snow Leopard, so this must be done manually. Also, "Xcode 4" cannot be installed on Snow Leopard, so "Xcode 3" must be used instead.')]),e._v(" "),n("p",[e._v("Access Apple's Xcode site "),n("a",{attrs:{href:"http://developer.apple.com/xcode",target:"_blank",rel:"noopener noreferrer"}},[e._v("http://developer.apple.com/xcode"),n("OutboundLink")],1),e._v(" and login with your Apple ID. You should get the screen shown in "),n("strong",[e._v("Figure 3.3")]),e._v(". Make sure to follow the link to download Xcode 3.")]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.3: Xcode 3 download screen (http://developer.apple.com/xcode/)")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(453),alt:""}})]),e._v(" "),n("p",[e._v("Once you have the installation package for Xcode, double click on the dmg file, and then double click on the mpkg file to start the installation of Xcode ("),n("strong",[e._v("Figure 3.4")]),e._v(").")]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.4: File in Xcode archives")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(454),alt:""}})]),e._v(" "),n("p",[e._v("The installation can be performed by following the default options for the most part, except for one part. In the screen shown in "),n("strong",[e._v("Figure 3.5")]),e._v(' for custom installation, make sure to place a check mark on "UNIX Development".')]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.5: Custom installation setting")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(455),alt:""}})]),e._v(" "),n("p",[e._v("Click next and continue on with the installation.")]),e._v(" "),n("h2",{attrs:{id:"nvidia-opencl-setup"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#nvidia-opencl-setup"}},[e._v("#")]),e._v(" "),n("em",[e._v("NVIDIA OpenCL Setup")])]),e._v(" "),n("p",[e._v("In this section, we will walk through the procedures for installing OpenCL for NVIDIA GPU's on Windows and Linux.")]),e._v(" "),n("p",[n("strong",[e._v("For Windows")])]),e._v(" "),n("p",[e._v("We will walkthrough the procedures for installing NVIDIA's OpenCL on a 32-bit Windows 7 machine. First, find out what GPU is present from Device Manager -> Display Adapter. Make sure this device supports CUDA. You will also need Visual Studio to build the SDK samples. For 32-bit, the Express Edition will suffice. Download and install Microsoft Visual C++ 2010 Express Edition from the URL below.\n"),n("a",{attrs:{href:"http://www.microsoft.com/japan/msdn/vstudio/express",target:"_blank",rel:"noopener noreferrer"}},[e._v("http://www.microsoft.com/japan/msdn/vstudio/express"),n("OutboundLink")],1)]),e._v(" "),n("p",[e._v("Download the following files from NVIDIA's OpenCL download page "),n("a",{attrs:{href:"http://developer.nvidia.com/cuda-downloads",target:"_blank",rel:"noopener noreferrer"}},[e._v("http://developer.nvidia.com/cuda-downloads"),n("OutboundLink")],1),e._v(":")]),e._v(" "),n("ul",[n("li",[e._v("Developer Drivers\n"),n("ul",[n("li",[e._v("Desktop: devdriver_4.0_winvista-win7_32_286.19_general.exe")]),e._v(" "),n("li",[e._v("Notebook: devdriver_4.0_winvista-win7_32_286.16_notebook.exe")])])]),e._v(" "),n("li",[e._v("CUDA Toolkit\n"),n("ul",[n("li",[e._v("cudatoolkit_4.1.28_win_32.msi")])])]),e._v(" "),n("li",[e._v("GPU Computing SDK\n"),n("ul",[n("li",[e._v("gpucomputingsdk_4.1.28_win_32.exe")])])])]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.6: NVIDIA OpenCL download page")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(456),alt:""}})]),e._v(" "),n("p",[e._v("The installation should be done in the following order: NVIDIA Driver, CUDA Toolkit, GPU Computing SDK. Double click on the NVIDIA driver executable to start the installation.")]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.7: NVIDIA driver install screen")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(457),alt:""}})]),e._v(" "),n("p",[e._v("Follow the prompts on the screens ("),n("strong",[e._v("Figure 3.7")]),e._v("). Restart the system when you are prompted to do so.")]),e._v(" "),n("p",[e._v("Next, install the CUDA Toolkit by double clicking on the installer. Follow the prompts on the screens ("),n("strong",[e._v("Figure 3.8")]),e._v(").")]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.8: NVIDIA toolkit install screen")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(458),alt:""}})]),e._v(" "),n("p",[e._v("Finally, install the GPU Computing SDK. Follow the prompts on the screens ("),n("strong",[e._v("Figure 3.9")]),e._v("). You will be prompted to register during the installation. Once the installation finishes successfully, restart the system.")]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.9: NVIDIA GPU computing SDK install screen")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(459),alt:""}})]),e._v(" "),n("p",[e._v('Now we are ready to execute the sample programs contained in the GPU Computing SDK. On your Desktop should be an icon with the name "NVIDIA GPU Computing SDK Browser". This should show a listing of all the sample programs. Open the "OpenCL Samples" tab to show a listing of the sample codes written in OpenCL. The listing is ordered based on difficulty, with basic programs at the top and advanced programs at the bottom. Some samples include a whitepaper that explains the program content.')]),e._v(" "),n("p",[n("strong",[e._v("For Linux")])]),e._v(" "),n("p",[e._v("In this section, we will install NVIDIA OpenCL on Ubuntu 11.04 (64 bit). First, make sure that the GPU is CUDA-enabled by executing the following command.")]),e._v(" "),n("blockquote",[n("p",[e._v("# lspci | grep -i nvidia")])]),e._v(" "),n("p",[e._v("> OS setup")]),e._v(" "),n("p",[e._v("Before we can install CUDA, we may need to reconfigure Ubuntu's graphic driver. This is due to the fact that the open-source version of the NVIDIA GPU driver, called \"nouveau\", may conflict with NVIDIA's driver.")]),e._v(" "),n("p",[e._v('First, remove all packages that start with "nvidia" using the command below.')]),e._v(" "),n("blockquote",[n("p",[e._v("$ sudo apt-get --purge remove nvidia*")])]),e._v(" "),n("p",[e._v("Next, create a blacklist file shown in "),n("strong",[e._v("List 3.1")]),e._v(" under /etc/modprobe.d/. This is to make sure that no nouveau-related kernel modules get loaded.")]),e._v(" "),n("p",[n("strong",[e._v("List 3.1: /etc/modprobe.d/blacklist-nouveau.conf")])]),e._v(" "),n("blockquote",[n("p",[e._v("blacklist nvidiafb")]),e._v(" "),n("p",[e._v("blacklist nouveau")]),e._v(" "),n("p",[e._v("blacklist rivafb")]),e._v(" "),n("p",[e._v("blacklist rivatv")]),e._v(" "),n("p",[e._v("blacklist vga16fb")]),e._v(" "),n("p",[e._v("options nouveau modeset=0")])]),e._v(" "),n("p",[e._v("Now, update initramfs using the command below.")]),e._v(" "),n("blockquote",[n("p",[e._v("$ sudo update-initramfs -u")])]),e._v(" "),n("p",[e._v("At this point, the system should be restarted. Once the system is restarted, install tools required for development.")]),e._v(" "),n("blockquote",[n("p",[e._v("$ sudo apt-get update")]),e._v(" "),n("p",[e._v("$ sudo apt-get install build-essential")])]),e._v(" "),n("p",[e._v("> CUDA setup")]),e._v(" "),n("p",[e._v("Download the following files from NVIDIA's OpenCL download page ("),n("strong",[e._v("Figure 3.10")]),e._v(") "),n("a",{attrs:{href:"http://developer.nvidia.com/cuda-downloads",target:"_blank",rel:"noopener noreferrer"}},[e._v("http://developer.nvidia.com/cuda-downloads"),n("OutboundLink")],1),e._v(":")]),e._v(" "),n("p",[e._v("* Developer Drivers")]),e._v(" "),n("p",[e._v("- Desktop: NVIDIA-Linux-x86_64-285.05.33.run")]),e._v(" "),n("p",[e._v("* CUDA Toolkit")]),e._v(" "),n("p",[e._v("- cudatoolkit_4.1.28_linux_64_ubuntu11.04.run")]),e._v(" "),n("p",[e._v("* GPU Computing SDK")]),e._v(" "),n("p",[e._v("- gpucomputingsdk_4.1.28_linux.run")]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.10: NVIDIA OpenCL download page (for Linux)")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(460),alt:""}})]),e._v(" "),n("p",[e._v('First task is to install the driver. However, the driver installation cannot be performed when the X Window System is running. Switch into the console mode by logging out and pressing "Alt + Ctrl + F2". Enter the following command to stop the display manager.')]),e._v(" "),n("blockquote",[n("p",[e._v("$ sudo service gdm stop")])]),e._v(" "),n("p",[e._v('You may need to press "Alt + Ctrl + F2" again to get back to the prompt. Enter the following to install the driver.')]),e._v(" "),n("blockquote",[n("p",[e._v("$ sudo sh NVIDIA-Linux-x86_64-285.05.33.run")])]),e._v(" "),n("p",[e._v('You will receive a few prompts, but select "OK" throughout. Once the installation finishes successfully, restart the system by entering:')]),e._v(" "),n("blockquote",[n("p",[e._v("$ sudo reboot")])]),e._v(" "),n("p",[e._v("Now we are ready to install the CUDA Toolkit. Enter the following command to do so.")]),e._v(" "),n("blockquote",[n("p",[e._v("$ sudo sh cudatoolkit_4.1.28_linux_64_ubuntu11.04.run")])]),e._v(" "),n("p",[e._v("You will be prompted for the installation directory, but use the default location, which should be /usr/local/cuda/. Once the installation is complete, a few environmental variables must be set in .bashrc ("),n("strong",[e._v("List 3.2")]),e._v(").")]),e._v(" "),n("p",[n("strong",[e._v("List 3.2: Append this at the end of the bashrc")])]),e._v(" "),n("blockquote",[n("p",[e._v('export CUDA_HOME="/usr/local/cuda"')]),e._v(" "),n("p",[e._v('export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}😒{CUDA_HOME}/lib64"')]),e._v(" "),n("p",[e._v("export PATH=${CUDA_HOME}/bin:${PATH}")])]),e._v(" "),n("p",[e._v("Lastly, the GPU Computing SDK will be installed. This SDK should be installed for each users. Login as a normal user, and enter the following command.")]),e._v(" "),n("blockquote",[n("p",[e._v("$ sh gpucomputingsdk_4.1.28_linux.run")])]),e._v(" "),n("p",[e._v("You will again be asked for an installation directory, but use the default location, which should be under $HOME. You maybe asked for the directory for CUDA Toolkit, in which case you should enter /usr/local/cuda/. The installation should now be finished.")]),e._v(" "),n("h2",{attrs:{id:"amd-opencl-setup"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#amd-opencl-setup"}},[e._v("#")]),e._v(" "),n("em",[e._v("AMD OpenCL Setup")])]),e._v(" "),n("p",[e._v('In this section, we will walk through the procedures for installing OpenCL for AMD GPU\'s on Windows and Linux. OpenCL for AMD is contained in "AMD APP SDK", which first requires the installation of the latest "Catalyst Software Suite", which contains drivers AMD CPU/GPU, OpenCL runtime, etc.')]),e._v(" "),n("p",[n("strong",[e._v("For Windows")])]),e._v(" "),n("p",[e._v("In this section, we will install AMD OpenCL on Windows 7.")]),e._v(" "),n("p",[e._v("Download and install the latest Catalyst Software Suite from the URL below ("),n("strong",[e._v("Figure 3.11")]),e._v("):\n"),n("a",{attrs:{href:"http://support.amd.com/us/gpudownload/Pages/index.aspx",target:"_blank",rel:"noopener noreferrer"}},[e._v("http://support.amd.com/us/gpudownload/Pages/index.aspx"),n("OutboundLink")],1)]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.11: Catalyst Software Suite download screen")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(461),alt:""}})]),e._v(" "),n("p",[e._v("Enter your system information for Steps 1~4, and press Step 5. This should give you a listing of the appropriate Catalyst Software Suite. Select the suite most appropriate to the system.")]),e._v(" "),n("p",[e._v("Now, download AMD APP SDK from the URL below ("),n("strong",[e._v("Figure 3.12")]),e._v("). The most up-to-date version is 1.6.")]),e._v(" "),n("p",[n("a",{attrs:{href:"http://developer.amd.com/sdks/AMDAPPSDK/downloads/Pages/default.aspx",target:"_blank",rel:"noopener noreferrer"}},[e._v("http://support.amd.com/us/gpudownload/Pages/index.aspx"),n("OutboundLink")],1)]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.12: AMD APP SDK download screen")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(462),alt:""}})]),e._v(" "),n("p",[e._v("Download and install the SDK, and restart the system once finished.")]),e._v(" "),n("p",[n("strong",[e._v("For Linux")])]),e._v(" "),n("p",[e._v("In this section, we will install AMD OpenCL on Ubuntu 11.4.")]),e._v(" "),n("p",[e._v("As is the case with Windows, the Catalyst Software Suite must be installed prior to the AMD APP SDK. To do so, first open the System Settings, located on the panel on the left side of the screen ("),n("strong",[e._v("Figure 3.13")]),e._v(").")]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.13: Ubuntu System Settings screen")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(463),alt:""}})]),e._v(" "),n("p",[e._v('Select "Additional Drivers" in the Hardware section. This will show a listing of proprietary drivers from vendors ('),n("strong",[e._v("Figure 3.14")]),e._v(' Select "Additional Drivers" in the Hardware section. This will show a listing of proprietary drivers from venders).')]),e._v(" "),n("p",[n("strong",[e._v("Figure 3.14: Vendor-supplied proprietary driver selection screen")])]),e._v(" "),n("p",[n("img",{attrs:{src:o(464),alt:""}})]),e._v(" "),n("p",[e._v('If more than one driver is listed, selecting one and clicking the "Activate" button will start the installation.')]),e._v(" "),n("p",[e._v("Next, download AMD APP SDK from the URL below ("),n("strong",[e._v("Figure 3.12")]),e._v("):")]),e._v(" "),n("p",[n("a",{attrs:{href:"http://developer.amd.com/sdks/AMDAPPSDK/downloads/Pages/default.aspx",target:"_blank",rel:"noopener noreferrer"}},[e._v("http://developer.amd.com/sdks/AMDAPPSDK/downloads/Pages/default.aspx"),n("OutboundLink")],1)]),e._v(" "),n("p",[e._v("Start the installation by entering commands as follows.")]),e._v(" "),n("p",[n("strong",[e._v("For 32bit")])]),e._v(" "),n("blockquote",[n("p",[e._v("$ tar xzf AMD-APP-SDK-v2.6-lnx32.tgz")]),e._v(" "),n("p",[e._v("$ sudo ./Install-AMD-APP.sh")]),e._v(" "),n("p",[e._v("[sudo] password for username:")]),e._v(" "),n("p",[e._v("32-bit Operating System Found...")]),e._v(" "),n("p",[e._v("Starting Installation of AMD APP....")]),e._v(" "),n("p",[e._v("SDK package name is :AMD-APP-SDK-v2.6-RC3-lnx32.tgz")]),e._v(" "),n("p",[e._v("Current directory path is : /home/opencl/appsdk")]),e._v(" "),n("p",[e._v("Untar command executed succesfully, The SDK package available")]),e._v(" "),n("p",[e._v("Untar command executed succesfully, The ICD package available")]),e._v(" "),n("p",[e._v("Copying files to /opt/AMDAPP/ ...")]),e._v(" "),n("p",[e._v("SDK files copied successfully at /opt/AMDAPP/")]),e._v(" "),n("p",[e._v("Updating Environment vairables...")]),e._v(" "),n("p",[e._v("32-bit path is :/opt/AMDAPP/lib/x86")]),e._v(" "),n("p",[e._v("Environment vairables updated successfully")]),e._v(" "),n("p",[e._v("/sbin/ldconfig.real: Can't stat /lib/i686-linux-gnu: No such file or directory")]),e._v(" "),n("p",[e._v("/sbin/ldconfig.real: Can't stat /usr/lib/i686-linux-gnu: No such file or directory")]),e._v(" "),n("p",[e._v("/sbin/ldconfig.real: Path `/lib/i386-linux-gnu' given more than once")]),e._v(" "),n("p",[e._v("/sbin/ldconfig.real: Path `/usr/lib/i386-linux-gnu' given more than once")]),e._v(" "),n("p",[e._v("AMD APP installation Completed")]),e._v(" "),n("p",[e._v(">> Reboot required to reflect the changes")]),e._v(" "),n("p",[e._v(">> Please ignore the ldconfig errors, Expected behaviour")]),e._v(" "),n("p",[e._v(">> Please refer the 'AMDAPPlog file' in the same directory")]),e._v(" "),n("p",[e._v(">> Refer the README.txt in the same directory for more info")])]),e._v(" "),n("hr"),e._v(" "),n("p",[e._v("As is shown in the installation log above, you should restart the system. After restarting, make sure the setup has completed successfully by making sure files such as /opt/AMDAPP/include/CL/cl.h and /usr/lib/libOpenCL* are present.")])])}),[],!1,null,null,null);t.default=s.exports}}]);