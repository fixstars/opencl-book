(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{488:function(e,t,o){"use strict";o.r(t);var n=o(56),s=Object(n.a)({},(function(){var e=this,t=e.$createElement,o=e._self._c||t;return o("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[o("h1",{attrs:{id:"basic-program-flow"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#basic-program-flow"}},[e._v("#")]),e._v(" Basic Program Flow")]),e._v(" "),o("h2",{attrs:{id:"basic-program-flow-2"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#basic-program-flow-2"}},[e._v("#")]),e._v(" "),o("strong",[e._v("Basic Program Flow")])]),e._v(" "),o("p",[e._v("The previous chapter introduced the procedure for building and running an existing sample code. By now, you should have an idea of the basic role of a host program and a kernel program. You should also know the difference between a host memory and a device memory, as well as when to use them.")]),e._v(" "),o("p",[e._v('This section will walk through the actual code of the "Hello, World!" program introduced in the last chapter.')]),e._v(" "),o("h2",{attrs:{id:"opencl-program"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#opencl-program"}},[e._v("#")]),e._v(" "),o("em",[e._v("OpenCL Program")])]),e._v(" "),o("p",[e._v("Creating an OpenCL program requires writing codes for the host side, as well as for the device side. The device is programmed in OpenCL C, as shown in "),o("strong",[e._v("List 3.3")]),e._v(" hello.cl. The host is programmed in C/C++ using an OpenCL runtime API, as shown in "),o("strong",[e._v("List 3.4")]),e._v(" hello.c.")]),e._v(" "),o("p",[e._v("The sections to follow will walk through each code.")]),e._v(" "),o("h2",{attrs:{id:"kernel-code"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#kernel-code"}},[e._v("#")]),e._v(" "),o("em",[e._v("Kernel Code")])]),e._v(" "),o("p",[e._v("The function to be executed on the device is defined as shown in "),o("strong",[e._v("List 4.1")]),e._v(". The OpenCL grammar will be explained in detail in Chapter 5, but for the time being, you can think of it as being the same as the standard C language.")]),e._v(" "),o("p",[o("strong",[e._v("List 4.1: Declaring a function to be executed on the kernel")])]),e._v(" "),o("div",{staticClass:"language- extra-class"},[o("pre",{pre:!0,attrs:{class:"language-text"}},[o("code",[e._v("__kernel void hello(__global char * string)\n")])])]),o("p",[e._v("The only differences with standard C are the following.")]),e._v(" "),o("p",[e._v('• The function specifier "__kernel" is used when declaring the "hello" function')]),e._v(" "),o("p",[e._v('• The address specifier "__global" is used to define the function\'s string argument')]),e._v(" "),o("p",[e._v('The "__kernel" specifies the function to be executed on the device. It must be called by the host, which is done by using one of the following OpenCL runtime API commands.')]),e._v(" "),o("p",[e._v("• Task call: clEnqueueTask()")]),e._v(" "),o("p",[e._v("• Data-parallel call: clEnqueueNDRangeKernel()")]),e._v(" "),o("p",[e._v("Since the kernel is not of a data-parallel nature, the clEnqueueTask() is called from the host to process the kernel.")]),e._v(" "),o("p",[e._v('The __global address specifier for the variable "string" tells the kernel that the address space to be used is part of the OpenCL global memory, which is the device-side main memory.')]),e._v(" "),o("p",[e._v("The kernel is only allowed read/write access to global, constant, local, and private memory, which is specified by __global, __constant, __local, __private, respectively. If this is not specified, it will assume the address space to be __private, which is the device-side register.")]),e._v(" "),o("h2",{attrs:{id:"host-code"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#host-code"}},[e._v("#")]),e._v(" "),o("em",[e._v("Host Code")])]),e._v(" "),o("p",[e._v("The host program tells the device to execute the kernel using the OpenCL runtime API.")]),e._v(" "),o("p",[e._v("Telling the device to execute the hello() kernel only requires the clEnqueueTask() command in the OpenCL runtime API, but other setup procedures must be performed in order to actually run the code. The procedure, which includes initialization, execution, and finalization, is listed below.")]),e._v(" "),o("p",[e._v("1. Get a list of available platforms")]),e._v(" "),o("p",[e._v("2. Select device")]),e._v(" "),o("p",[e._v("3. Create Context")]),e._v(" "),o("p",[e._v("4. Create command queue")]),e._v(" "),o("p",[e._v("5. Create memory objects")]),e._v(" "),o("p",[e._v("6. Read kernel file")]),e._v(" "),o("p",[e._v("7. Create program object The OpenCL Programming Book 78")]),e._v(" "),o("p",[e._v("8. Build kernel")]),e._v(" "),o("p",[e._v("9. Create kernel object")]),e._v(" "),o("p",[e._v("10. Set kernel arguments")]),e._v(" "),o("p",[e._v("11. Execute kernel (Enqueue task) ← hello() kernel function is called here")]),e._v(" "),o("p",[e._v("12. Read memory object")]),e._v(" "),o("p",[e._v("13. Free objects")]),e._v(" "),o("p",[e._v("We will go through each step of the procedure using hello.c in "),o("strong",[e._v("List 3.4")]),e._v(" as an example.")]),e._v(" "),o("p",[o("strong",[e._v("Get a List of Available Platform")])]),e._v(" "),o("p",[e._v("The first thing that must be done on the host-side is to get a list of available OpenCL platforms. This is done in the following code segment from hello.c in "),o("strong",[e._v("List 3.4")]),e._v(".")]),e._v(" "),o("div",{staticClass:"language- extra-class"},[o("pre",{pre:!0,attrs:{class:"language-text"}},[o("code",[e._v("cl_platform_id platform_id = NULL \n... \ncl_uint ret_num_platforms; \n... \nret = clGetPlatformIDs(1, &platform_id, &ret_num_platforms); \n")])])]),o("p",[e._v("The platform model in OpenCL consists of a host connected to one or more OpenCL devices.")]),e._v(" "),o("p",[e._v("The clGetPlatformIDs() function in line 44 allows the host program to discover OpenCL devices, which is returned as a list to the pointer platform_id of type cl_platform_id. The 1st argument specifies how many OpenCL platforms to find which most of the time is one. The 3rd argument returns the number of OpenCL platforms that can be used.")]),e._v(" "),o("h3",{attrs:{id:"select-device"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#select-device"}},[e._v("#")]),e._v(" "),o("strong",[e._v("Select Device")])]),e._v(" "),o("p",[e._v("The next step is to select a GPU device within the platform. This is done in the following code segment from hello.c in "),o("strong",[e._v("List 3.4")]),e._v(".")]),e._v(" "),o("div",{staticClass:"language- extra-class"},[o("pre",{pre:!0,attrs:{class:"language-text"}},[o("code",[e._v("cl_device_id device_id = NULL; \n... \ncl_uint ret_num_devices; \n...\nret = clGetDeviceIDs(platform_id, CL_DEVICE_TYPE_DEFAULT, 1, &device_id, &ret_num_devices); \n")])])]),o("p",[e._v("The clGetDeviceIDs() function in line 45 selects the device to be used. The 1st argument is the platform that contains the desired device. The 2nd argument specifies the device type. In this case, CL_DEVICE_TYPE_DEFAULT is passed, which specifies whatever set as default in the platform to be used as the device. If the desired device is the GPU, then this should be CL_DEVICE_TYPE_GPU, and if it is CPU, then this should be CL_DEVICE_TYPE_CPU.")]),e._v(" "),o("p",[e._v("The 3rd argument specifies the number of devices to use. The 4th argument returns the handle to the selected device. The 5th argument returns the number of devices that corresponds to the device type specified in the 2nd argument. If the specified device does not exist, then ret_num_devices will be set to 0.")]),e._v(" "),o("h3",{attrs:{id:"create-context"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#create-context"}},[e._v("#")]),e._v(" "),o("strong",[e._v("Create Context")])]),e._v(" "),o("p",[e._v("After getting the device handle, the next step is to create an OpenCL Context. This is done in the following code segment from hello.c in "),o("strong",[e._v("List 3.4")]),e._v(".")]),e._v(" "),o("div",{staticClass:"language- extra-class"},[o("pre",{pre:!0,attrs:{class:"language-text"}},[o("code",[e._v("cl_context context = NULL; \n... \ncontext = clCreateContext(NULL, 1, &device_id, NULL, NULL, &ret); \n")])])]),o("p",[e._v("An OpenCL context is created with one or more devices, using the clCreateContext() function in line 48. The 2nd argument specifies the number of devices to use. The 3rd argument specifies the list of device handlers. The context is used by the OpenCL runtime for managing objects, which will be discussed later.")]),e._v(" "),o("p",[o("strong",[e._v("Create Command Queue")])]),e._v(" "),o("p",[e._v("The command queue is used to control the device. In OpenCL, any command from the host to the device, such as kernel execution or memory copy, is performed through this command queue. For each device, one or more command queue objects must be created. This is done in the following code segment from hello.c in "),o("strong",[e._v("List 3.4")]),e._v(".")]),e._v(" "),o("div",{staticClass:"language- extra-class"},[o("pre",{pre:!0,attrs:{class:"language-text"}},[o("code",[e._v("cl_command_queue command_queue = NULL; \n... \ncommand_queue = clCreateCommandQueue(context, device_id, 0, &ret); \n")])])]),o("p",[e._v("The clCreateCommandQueue() function in line 51 creates the command queue. The 1st argument specifies the context in which the command queue will become part of. The 2nd argument specifies the device which will execute the command in the queue. The function returns a handle to the command queue, which will be used for memory copy and kernel execution.")]),e._v(" "),o("h3",{attrs:{id:"create-memory-object"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#create-memory-object"}},[e._v("#")]),e._v(" "),o("strong",[e._v("Create Memory Object")])]),e._v(" "),o("p",[e._v("To execute a kernel, all data to be processed must be on the device memory. However, the kernel does not have the capability to access memory outside of the device. Therefore, this action must be performed on the host-side. To do this, a memory object must be created, which allows the host to access the device memory. This is done in the following code segment from hello.c in "),o("strong",[e._v("List 3.4")]),e._v(".")]),e._v(" "),o("blockquote",[o("p",[e._v("018: cl_mem memobj = NULL;")]),e._v(" "),o("p",[e._v("...")]),e._v(" "),o("p",[e._v("054: memobj = clCreateBuffer(context, CL_MEM_READ_WRITE, MEM_SIZE * sizeof(char), NULL, &ret);")])]),e._v(" "),o("p",[e._v('The clCreateBuffer() function in line 54 allocates space on the device memory. The allocated memory can be accessed from the host side using the returned memobj pointer. The 1st argument specifies the context in which the memory object will become part of. The 2nd argument specifies a flag describing how it will be used. The CL_MEM_READ_WRITE flag allows the kernel to both read and write to the allocated device memory10. The 3rd argument specifies the number of bytes to allocate. In this example, this allocated storage space gets the character string "Hello, World!", which is done in the hello.cl kernel in '),o("strong",[e._v("List 3.3")]),e._v(".")]),e._v(" "),o("h3",{attrs:{id:"read-kernel-file"}},[o("a",{staticClass:"header-anchor",attrs:{href:"#read-kernel-file"}},[e._v("#")]),e._v(" "),o("strong",[e._v("Read Kernel File")])]),e._v(" "),o("p",[e._v("As mentioned earlier, the kernel can only be executed via the host-side program. To do this, the host program must first read the kernel program. This may be in a form of an executable binary, or a source code which must be compiled using an OpenCL compiler. In this example, the host reads the kernel source code. This is done using the standard fread() function.")]),e._v(" "),o("blockquote",[o("p",[e._v("028: FILE *fp;")]),e._v(" "),o("p",[e._v('029: char fileName[] = "./hello.cl";')]),e._v(" "),o("p",[e._v("030: char *source_str;")]),e._v(" "),o("p",[e._v("031: size_t source_size;")]),e._v(" "),o("p",[e._v("032:")]),e._v(" "),o("p",[e._v("033: /* Load kernel code */")]),e._v(" "),o("p",[e._v('034: fp = fopen(fileName, "r");')]),e._v(" "),o("p",[e._v("035: if (!fp) {")]),e._v(" "),o("p",[e._v('036: fprintf(stderr, "Failed to load kernel.¥n");')]),e._v(" "),o("p",[e._v("037: exit(1);")]),e._v(" "),o("p",[e._v("038: }")]),e._v(" "),o("p",[e._v("039: source_str = (char*)malloc(MAX_SOURCE_SIZE);")]),e._v(" "),o("p",[e._v("040: source_size = fread(source_str, 1, MAX_SOURCE_SIZE, fp);")]),e._v(" "),o("p",[e._v("041: fclose(fp);")])]),e._v(" "),o("p",[o("strong",[e._v("Create Program Object")])]),e._v(" "),o("p",[e._v("Once the source code is read, this code must be made into a kernel program. This step is required, since the kernel program can contain multiple kernel functions11. This is done by creating a program object, as shown in the following code segment from hello.c in "),o("strong",[e._v("List 3.4")]),e._v(".")]),e._v(" "),o("blockquote",[o("p",[e._v("019: cl_program program = NULL;")]),e._v(" "),o("p",[e._v("...")]),e._v(" "),o("p",[e._v("057: program = clCreateProgramWithSource(context, 1, (const char **)&source_str,")]),e._v(" "),o("p",[e._v("058: (const size_t *)&source_size, &ret);")])]),e._v(" "),o("p",[e._v("The program object is created using the clCreateProgramWithSource() function. The 3rd argument specifies the read-in source code, and the 4th argument specifies the size of the source code in bytes. If the program object is to be created from a binary, clCreateProgramWithBinary() is used instead.")]),e._v(" "),o("p",[o("strong",[e._v("Build")])]),e._v(" "),o("p",[e._v("The next step is to build the program object using an OpenCL C compiler and linker.")]),e._v(" "),o("blockquote",[o("p",[e._v("061: ret = clBuildProgram(program, 1, &device_id, NULL, NULL, NULL);")])]),e._v(" "),o("p",[e._v("The clBuildProgram in line 61 builds the program object to create a binary. The 1st argument is the program object to be compiled. The 3rd argument is the target device for which the binary is created. The 2nd argument is the number of target devices. The 4th argument specifies the compiler option string.")]),e._v(" "),o("p",[e._v("Note that this step is unnecessary if the program is created from binary using clCreateProgramWithBinary().")]),e._v(" "),o("p",[o("strong",[e._v("Create Kernel Object")])]),e._v(" "),o("p",[e._v("Once the program object is compiled, the next step is to create a kernel object. Each kernel object corresponds to each kernel function. Therefore, it is necessary to specify the kernel function's name when creating the kernel object.")]),e._v(" "),o("blockquote",[o("p",[e._v("020: cl_kernel kernel = NULL;")]),e._v(" "),o("p",[e._v("...")]),e._v(" "),o("p",[e._v('064: kernel = clCreateKernel(program, "hello", &ret);')])]),e._v(" "),o("p",[e._v("The clCreateKernel() function in line 64 creates the kernel object from the program. The 1st argument specifies the program object, and the 2nd argument sets the kernel function name.")]),e._v(" "),o("p",[e._v("This example only has one kernel function for one program object, but it is possible to have multiple kernel functions for one program object. However, since each kernel object corresponds to one kernel function, the clCreateKernel() function must be called multiple times.")]),e._v(" "),o("p",[o("strong",[e._v("Set Kernel Arguments")])]),e._v(" "),o("p",[e._v("Once the kernel object is created, the arguments to the kernel must be set. In this example, hello.cl in "),o("strong",[e._v("List 3.3")]),e._v(" expects a pointer to a string array to be built on the device side. This pointer must be specified on the host-side. In this example, the pointer to the allocated memory object is passed in. In this way, the memory management can be performed on the host-side.")]),e._v(" "),o("blockquote",[o("p",[e._v("067: ret = clSetKernelArg(kernel, 0, sizeof(cl_mem), (void *) &memobj);")])]),e._v(" "),o("p",[e._v("The clSetKernelArg() function in line 67 sets the arguments to be passed into the kernel. The 1st argument is the kernel object. The 2nd argument selects which argument of the kernel is being passed in, which is 0 in this example, meaning the 0th argument to the kernel is being set. The 4th argument is the pointer to the argument to be past in, with the 3rd argument specifying this argument size in bytes. In this way, the clSetKernelArg() must be called for each kernel arguments.")]),e._v(" "),o("p",[e._v("Passing of the host-side data as a kernel argument can be done as follows.")]),e._v(" "),o("blockquote",[o("p",[e._v("int a =10;")]),e._v(" "),o("p",[e._v("clSetKernelArg(kernel, 0, sizeof(int), (void *)&a);")])]),e._v(" "),o("p",[o("strong",[e._v("Execute Kernel (Enqueue task)")])]),e._v(" "),o("p",[e._v("The kernel can now finally be executed. This is done by the code segment from hello.c in "),o("strong",[e._v("List 3.4")])]),e._v(" "),o("blockquote",[o("p",[e._v("070: ret = clEnqueueTask(command_queue, kernel, 0, NULL, NULL);")])]),e._v(" "),o("p",[e._v("This throws the kernel into the command queue, to be executed on the compute unit on the device. Note that this function is asynchronous, meaning it just throws the kernel into the queue to be executed on the device. The code that follows the clEnqueueTask() function should account for this.")]),e._v(" "),o("p",[e._v('In order to wait for the kernel to finish executing, the 5th argument of the above function must be set as an event object. This will be explained in "4-3-3 Task Parallelism and Event Object".')]),e._v(" "),o("p",[e._v("Also, the clEnqueueTask() function is used for task-parallel instructions. Data-parallel instructions should use the clEnqueueNDRangeKernel() function instead.")]),e._v(" "),o("p",[o("strong",[e._v("Read from the memory object")])]),e._v(" "),o("p",[e._v("After processing the data on the kernel, the result must now be transferred back to the host-side. This is done in the following code segment from hello.c in "),o("strong",[e._v("List 3.4")]),e._v(".")]),e._v(" "),o("blockquote",[o("p",[e._v("026: char string[MEM_SIZE];")]),e._v(" "),o("p",[e._v("...")]),e._v(" "),o("p",[e._v("073: ret = clEnqueueReadBuffer(command_queue, memobj, CL_TRUE, 0,")]),e._v(" "),o("p",[e._v("074: MEM_SIZE * sizeof(char), string, 0, NULL, NULL);")])]),e._v(" "),o("p",[e._v('The clEnqueueReadBuffer() function in lines 73~74 copies the data on the device-side memory to the host-side memory. To copy the data from the host-side memory to the device-side memory, the clEnqueueWriteBuffer() function is used instead. As the term "Enqueue" in the function indicates, the data copy instruction is placed in the command queue before it is processed. The 2nd argument is the pointer to the memory on the device to be copied over to the host side, while the 5th argument specifies the size of the data in bytes. The 6th argument is the pointer to the host-side memory where the data is copied over to. The 3rd argument specifies whether the command is synchronous or asynchronous. The "CL_TRUE" that is passed in makes the function synchronous, which keeps the host from executing the next command until the data copy finishes. If "CL_FALSE" is passed in instead, the copy becomes asynchronous, which queues the task and immediately executes the next instruction on the host-side.')]),e._v(" "),o("p",[e._v('Recall, however, that the "hello" kernel was queued asynchronously. This should make you question whether the memory copy from the device is reading valid data.')]),e._v(" "),o("p",[e._v('Looking just at the host-side code, it might make you think that this is a mistake. However, in this case it is OK. This is because when the command queue was created, the 3rd argument passed in was a 0, which makes the queued commands execute in order. Therefore, the data copy command waits until the previous command in the queue, the "hello" kernel, is finished. If the command queue was set to allow asynchronous execution, the data copy may start before the kernel finishes its processing of the data, which will achieve incorrect results. Asynchronous kernel execution may be required in some cases, however, and a way to do this is explained in "4-3 Kernel Call".')]),e._v(" "),o("p",[o("strong",[e._v("Free Objects")])]),e._v(" "),o("p",[e._v("Lastly, all the objects need to be freed. This is done in the code segment shown below from hello.c in "),o("strong",[e._v("List 3.4")]),e._v(".")]),e._v(" "),o("blockquote",[o("p",[e._v("082: ret = clReleaseKernel(kernel);")]),e._v(" "),o("p",[e._v("083: ret = clReleaseProgram(program);")]),e._v(" "),o("p",[e._v("084: ret = clReleaseMemObject(memobj);")]),e._v(" "),o("p",[e._v("085: ret = clReleaseCommandQueue(command_queue);")]),e._v(" "),o("p",[e._v("086: ret = clReleaseContext(context);")])]),e._v(" "),o("p",[e._v("In real-life applications, the main course of action is usually a repetition of setting kernel arguments or the host-to-device copy -> kernel execution -> device-to-host copy cycle, so object creation/deletion cycle do not usually have to be repeated, since the same object can be used repeatedly. If too many objects are created without freeing, the host-side's object management memory space may run out, in which case the OpenCL runtime will throw an error.")]),e._v(" "),o("hr")])}),[],!1,null,null,null);t.default=s.exports}}]);